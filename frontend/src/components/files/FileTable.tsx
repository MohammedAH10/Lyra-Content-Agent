import Link from 'next/link';
import type { FileRecord } from '@/types';
import FileStatusBadge from './FileStatusBadge';
import { formatFileSize, formatDate } from '@/utils/formatters';

export default function FileTable({ files }: { files: FileRecord[] }) {
  return (
    <div className="overflow-x-auto">
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
  );
}
