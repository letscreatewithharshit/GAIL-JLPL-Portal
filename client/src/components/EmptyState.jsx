import React from 'react';
import { FolderOpen } from 'lucide-react';
export default function EmptyState({title='No records found',text='Records will appear here once they are added by an authorized administrator.'}){return <div className="empty-state"><FolderOpen size={30}/><strong>{title}</strong><span>{text}</span></div>}
