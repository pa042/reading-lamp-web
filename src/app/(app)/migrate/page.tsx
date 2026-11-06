import MigrateFromArtifact from "@/components/MigrateFromArtifact";

export default function MigratePage() {
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-black mb-4">データ移行</h1>
      <MigrateFromArtifact />
    </div>
  );
}
