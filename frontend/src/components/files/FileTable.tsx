import Link from 'next/link';
import type { FileRecord } from '@/types';
import FileStatusBadge from './FileStatusBadge';
import { formatFileSize, formatDate } from '@/utils/formatters';

export default function FileTable({ files }: { files: FileRecord[] }) {
  return (
    <>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="text-left py-3 px-4 font-medium text-text-muted">Name</th>
              <th className="text-left py-3 px-4 font-medium text-text-muted">Type</th>
              <th className="text-left py-3 px-4 font-medium text-text-muted">Size</th>
              <th className="text-left py-3 px-4 font-medium text-text-muted">Status</th>
              <th className="text-left py-3 px-4 font-medium text-text-muted">Upload Date</th>
              <th className="text-left py-3 px-4 font-medium text-text-muted">Tags</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-b border-glass-border hover:bg-white/5">
                <td className="py-3 px-4">
                  <Link href={`/files/${file.id}`} className="text-neon-cyan hover:brightness-125 font-medium">
                    {file.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-text-muted capitalize">{file.type}</td>
                <td className="py-3 px-4 text-text-muted">{formatFileSize(file.size)}</td>
                <td className="py-3 px-4"><FileStatusBadge status={file.status} /></td>
                <td className="py-3 px-4 text-text-muted">{formatDate(file.uploadDate)}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs glass-card px-1.5 py-0.5 rounded text-text-muted">
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="text-xs text-text-muted">+{file.tags.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {files.map((file) => (
          <Link
            key={file.id}
            href={`/files/${file.id}`}
            className="glass-card rounded-xl p-4 block hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-neon-cyan font-medium text-sm truncate mr-2">{file.name}</span>
              <FileStatusBadge status={file.status} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted">
              <span>Type: <span className="text-on-surface capitalize">{file.type}</span></span>
              <span>Size: <span className="text-on-surface">{formatFileSize(file.size)}</span></span>
              <span className="col-span-2">Uploaded: <span className="text-on-surface">{formatDate(file.uploadDate)}</span></span>
              {file.tags.length > 0 && (
                <span className="col-span-2">
                  Tags:{' '}
                  <span className="text-on-surface">
                    {file.tags.slice(0, 3).join(', ')}
                    {file.tags.length > 3 && ` +${file.tags.length - 3}`}
                  </span>
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
