export default async function getAllOrders() {
  const result = await fetch(
    "http://localhost:5000/orders"
  );
  return result.json();
}
