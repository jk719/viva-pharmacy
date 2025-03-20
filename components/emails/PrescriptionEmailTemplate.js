import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function PrescriptionEmailTemplate({
  name,
  status,
  prescriptionId,
  note,
}) {
  const previewText = `Your prescription has been ${status}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto p-8 max-w-[600px]">
            <Section className="bg-white rounded-xl shadow-sm p-8">
              {/* Logo */}
              <Img
                src={`${baseUrl}/images/viva-online-logo.png`}
                alt="VIVA Pharmacy"
                width="200"
                height="50"
                className="mx-auto mb-8"
              />

              {/* Status Header */}
              <Heading className="text-2xl font-bold text-gray-800 mb-4">
                Prescription {status === 'verified' ? 'Approved' : 'Update Required'}
              </Heading>

              {/* Greeting */}
              <Text className="text-gray-700 mb-4">
                Hello {name},
              </Text>

              {/* Main Content */}
              {status === 'verified' ? (
                <>
                  <Text className="text-gray-700 mb-6">
                    Great news! Your prescription has been verified by our pharmacist.
                    You can now proceed with the checkout process to get your
                    medication delivered.
                  </Text>

                  <Button
                    href={`${baseUrl}/prescriptions/checkout/${prescriptionId}`}
                    className="bg-[#FF9F43] text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Proceed to Checkout
                  </Button>
                </>
              ) : (
                <Text className="text-gray-700 mb-6">
                  Our pharmacist has reviewed your prescription and requires some
                  additional information or clarification:
                  <br /><br />
                  {note}
                  <br /><br />
                  Please contact us at {process.env.PHARMACY_PHONE} or reply to this
                  email for assistance.
                </Text>
              )}

              {/* Footer */}
              <Hr className="border-gray-200 my-8" />
              
              <Section className="text-gray-600 text-sm">
                <Text className="mb-4">
                  If you have any questions, please don't hesitate to contact us:
                </Text>
                <Text className="mb-2">
                  Phone: {process.env.PHARMACY_PHONE}
                </Text>
                <Text className="mb-2">
                  Email: {process.env.PHARMACY_EMAIL}
                </Text>
              </Section>

              {/* Additional Info */}
              <Text className="text-xs text-gray-500 mt-8">
                This email was sent from VIVA Pharmacy. Please do not reply directly
                to this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
} 