export default async function getAllOrders() {
  const result = await fetch(
    "https://profit-first-server.vercel.app/orders"
  );
  return result.json();
}
