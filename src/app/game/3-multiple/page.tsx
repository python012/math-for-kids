import { readFileSync } from "fs";
import path from "path";

export default function MultipleGame() {
  const htmlPath = path.join(process.cwd(), "src/app/game/3-multiple/multiple.html");
  const htmlContent = readFileSync(htmlPath, "utf-8");

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
