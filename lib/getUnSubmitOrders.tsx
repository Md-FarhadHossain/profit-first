export default async function getUnSubmitOrders() {
  const result = await fetch(
    "https://profit-first-server.vercel.app/partial-orders"
  );
  return result.json();
}
