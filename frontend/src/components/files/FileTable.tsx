import Link from 'next/link';
import type { FileRecord } from '@/types';
import FileStatusBadge from './FileStatusBadge';
import { formatFileSize, formatDate } from '@/utils/formatters';

export default function FileTable({ files }: { files: FileRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Size</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Upload Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Tags</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <Link href={`/files/${file.id}`} className="text-lyra-600 hover:text-lyra-800 font-medium">
                  {file.name}
                </Link>
              </td>
              <td className="py-3 px-4 text-gray-600 capitalize">{file.type}</td>
              <td className="py-3 px-4 text-gray-600">{formatFileSize(file.size)}</td>
              <td className="py-3 px-4"><FileStatusBadge status={file.status} /></td>
              <td className="py-3 px-4 text-gray-600">{formatDate(file.uploadDate)}</td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {file.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{file.tags.length - 3}</span>
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
