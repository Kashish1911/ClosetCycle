import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PresentationFile } from 'file:///C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_arm64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const SKILL_DIR='C:/Users/Admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1119.11507/skills/presentations';
const workspaceDir='C:/Users/Admin/OneDrive/Documents/ChatGPT/kashish\'s project sem5';
const candidatePath=path.join(workspaceDir,'deliverables','Closet-Cycle-Startup-Project.pptx');
const finalPath=path.join(workspaceDir,'deliverables','Closet-Cycle-Startup-Project-Final.pptx');
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL_DIR,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({workspaceDir,candidatePath,finalPath,pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_arm64__3k8sg7r9htsxt/dependencies/python/python.exe',integrityValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','9144000,5143500','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:20,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],verifyArtifactToolImport:true,receiptPath:path.join(workspaceDir,'.ppt-build','Closet-Cycle-Startup-Project.validation.json')});console.log(JSON.stringify(result));
