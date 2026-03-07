import { Check, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type NetworkCapabilityRow } from '@/lib/marketing-content';

interface IntegrationsCapabilityTableProps {
  rows: NetworkCapabilityRow[];
}

const CapabilityMark = ({ enabled }: { enabled: boolean }) =>
  enabled ? <Check className="h-4 w-4 text-green-600" /> : <Minus className="h-4 w-4 text-muted-foreground" />;

export function IntegrationsCapabilityTable({ rows }: IntegrationsCapabilityTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Network</TableHead>
          <TableHead>Publish</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Inbox</TableHead>
          <TableHead>Analytics</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.network}>
            <TableCell className="font-medium">{row.network}</TableCell>
            <TableCell><CapabilityMark enabled={row.publish} /></TableCell>
            <TableCell><CapabilityMark enabled={row.schedule} /></TableCell>
            <TableCell><CapabilityMark enabled={row.inbox} /></TableCell>
            <TableCell><CapabilityMark enabled={row.analytics} /></TableCell>
            <TableCell>
              <Badge variant="outline">{row.note}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
