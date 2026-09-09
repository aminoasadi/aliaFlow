import { listUploadedFiles, isFileReferenced } from "@/lib/media";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaDeleteButton } from "@/components/admin/MediaDeleteButton";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { CopyMediaButton } from "@/components/admin/CopyMediaButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageIcon } from "lucide-react";

export default async function MediaLibraryPage() {
  const files = await listUploadedFiles();
  const usage = await Promise.all(files.map((file) => isFileReferenced(file.url)));

  return (
    <div className="admin-page">
      <PageHeader kicker="Asset library" title="Media" description={`${files.length} uploaded image${files.length===1?"":"s"}. Upload once, then reuse assets across any content section.`} actions={<MediaUploader />} />
      {files.length === 0 ? (
        <Card className="grid place-items-center gap-2 p-14 text-center"><ImageIcon className="size-8 text-muted-foreground"/><b>Your library is empty</b><p className="m-0 text-sm text-muted-foreground">Upload the first image to make it available to editors.</p></Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file, index) => {
            const usedBy = usage[index];
            return (
              <Card key={file.filename} className="group gap-0 overflow-hidden py-0">
                <CardContent className="p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt="" className="aspect-square w-full object-cover" />
                </CardContent>
                <CardFooter className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1"><p className="m-0 w-full truncate text-xs font-medium">{file.filename}</p>
                  {usedBy.length > 0 ? (
                    <Badge variant="secondary" className="mt-1">Used {usedBy.length}×</Badge>
                  ) : <span className="text-[10px] text-muted-foreground">Unused</span>}</div><CopyMediaButton url={file.url}/>{usedBy.length===0?<MediaDeleteButton filename={file.filename}/>:null}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
