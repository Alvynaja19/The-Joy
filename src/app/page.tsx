import contentData from "../../data/content.json";
import Landing from "../landing";

export default function Page() {
  return <Landing data={contentData} />;
}
