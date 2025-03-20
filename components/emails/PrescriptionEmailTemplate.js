import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components';
import { format } from 'date-fns';

export default function PrescriptionEmailTemplate({
  name,
  status,
  prescriptionId,
  note,
  verifiedBy
}) {
  const previewText = `Your prescription has been ${status}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/images/viva-online-logo.png`}
              alt="VIVA Pharmacy"
              width="200"
              height="50"
            />
          </Section>

          <Heading style={styles.heading}>
            Prescription {status === 'verified' ? 'Approved' : 'Update Required'}
          </Heading>

          <Text style={styles.text}>
            Hello {name},
          </Text>

          {status === 'verified' ? (
            <>
              <Text style={styles.text}>
                Great news! Your prescription has been verified by our pharmacist.
                You can now proceed with the checkout process to get your
                medication delivered.
              </Text>

              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL}/prescriptions/checkout/${prescriptionId}`}
                style={styles.button}
              >
                Proceed to Checkout
              </Button>
            </>
          ) : (
            <Text style={styles.text}>
              Our pharmacist has reviewed your prescription and requires some
              additional information or clarification:
              <br /><br />
              {note}
              <br /><br />
              Please contact us at {process.env.PHARMACY_PHONE} or reply to this
              email for assistance.
            </Text>
          )}

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              If you have any questions, please don't hesitate to contact us:
            </Text>
            <Text style={styles.footerText}>
              Phone: {process.env.PHARMACY_PHONE}
              <br />
              Email: {process.env.PHARMACY_EMAIL}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  container: {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px'
  },
  logoSection: {
    padding: '20px 0'
  },
  heading: {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#484848',
    padding: '17px 0 0'
  },
  text: {
    margin: '0 0 10px',
    color: '#484848',
    fontSize: '16px',
    lineHeight: '24px'
  },
  button: {
    backgroundColor: '#FF9F43',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    padding: '12px 20px',
    margin: '20px 0'
  },
  footer: {
    borderTop: '1px solid #ddd',
    marginTop: '20px',
    paddingTop: '20px'
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 10px'
  }
}; 