import './globals.css';

export const metadata = {
  title: 'Location Verification Test',
  description: 'Test geolocation-based order verification',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
