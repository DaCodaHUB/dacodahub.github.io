import data from "../../data/reading_plan.json";
export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
