import { getAllEducations } from "../lib/education";
import EducationSectionClient from "./EducationSectionClient";

export default function EducationSection() {
  const educations = getAllEducations();
  return <EducationSectionClient educations={educations} />;
}
