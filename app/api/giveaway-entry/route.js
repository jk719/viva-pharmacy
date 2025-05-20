import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, zip, emailOptIn, smsOptIn } = data;
    
    // Validate required fields
    if (!name || !email || !phone || !zip) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Store giveaway entry in database
    // We'll associate it with a user if they exist, otherwise create a new entry
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update preferences if user exists
      existingUser.giveawayEntries = existingUser.giveawayEntries || [];
      existingUser.giveawayEntries.push({
        name,
        phone,
        zip,
        eventName: 'TV Giveaway',
        entryDate: new Date(),
      });

      // Update marketing preferences if they've opted in
      if (emailOptIn) {
        existingUser.emailMarketingOptIn = true;
      }
      
      if (smsOptIn) {
        existingUser.smsMarketingOptIn = true;
      }

      await existingUser.save();
      console.log(`Existing user entered giveaway: ${email}`);
    } else {
      // For non-users, we'll create a simplified record
      // This could be expanded to create a full user account if desired
      await User.create({
        name,
        email,
        phone,
        zip,
        emailMarketingOptIn: emailOptIn,
        smsMarketingOptIn: smsOptIn,
        giveawayEntries: [{
          name,
          phone,
          zip,
          eventName: 'TV Giveaway',
          entryDate: new Date(),
        }],
        role: 'customer',
      });
      console.log(`New giveaway entry created: ${email}`);
    }

    // You could also trigger an email notification here
    // emailService.sendGiveawayConfirmation(email, name);

    return NextResponse.json({ 
      status: 'success',
      message: 'Giveaway entry received successfully'
    });
  } catch (error) {
    console.error('Error processing giveaway entry:', error);
    return NextResponse.json(
      { error: 'Failed to process entry' },
      { status: 500 }
    );
  }
}
