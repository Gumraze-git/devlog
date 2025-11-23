import ProjectsSectionClient from "./ProjectsSectionClient";
import { getAllProjects } from "../lib/projects";

export default function ProjectsSection() {
  const projects = getAllProjects();
  return <ProjectsSectionClient projects={projects} />;
}
