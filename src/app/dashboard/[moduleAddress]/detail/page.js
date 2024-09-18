import ModuleDetailView from "src/sections/module/view"

export default function ModuelDetail({ params }) {
    const { moduleAddress } = params;
  
    return <ModuleDetailView moduleAddress={moduleAddress} />;
  }