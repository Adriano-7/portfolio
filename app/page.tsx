import { getProjectMetas } from "@/lib/projects";
import { Works } from "@/components/ui/Works";

export default function Home() {
  const projects = getProjectMetas();
  return <Works projects={projects} />;
}
