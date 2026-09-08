import { listUploadedFiles, isFileReferenced } from "@/lib/media";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaDeleteButton } from "@/components/admin/MediaDeleteButton";

export default async function MediaLibraryPage() {
  const files = await listUploadedFiles();
  const usage = await Promise.all(files.map((file) => isFileReferenced(file.url)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="text-muted-foreground">
          {files.length} uploaded image{files.length === 1 ? "" : "s"}.
        </p>
      </div>
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file, index) => {
            const usedBy = usage[index];
            return (
              <Card key={file.filename} className="overflow-hidden py-0">
                <CardContent className="p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt="" className="aspect-square w-full object-cover" />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 py-4">
                  <p className="w-full truncate text-xs text-muted-foreground">{file.filename}</p>
                  {usedBy.length > 0 ? (
                    <Badge variant="secondary">
                      Used by {usedBy.length} section{usedBy.length === 1 ? "" : "s"}
                    </Badge>
                  ) : (
                    <MediaDeleteButton filename={file.filename} />
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
