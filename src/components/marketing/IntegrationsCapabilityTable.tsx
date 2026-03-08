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
  enabled ? <Check className="h-4 w-4 text-[hsl(var(--mk-mint-strong))]" /> : <Minus className="h-4 w-4 text-[hsl(var(--mk-muted))]" />;

export function IntegrationsCapabilityTable({ rows }: IntegrationsCapabilityTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[hsl(var(--mk-border))]">
          <TableHead className="text-[hsl(var(--mk-muted))]">Network</TableHead>
          <TableHead className="text-[hsl(var(--mk-muted))]">Publish</TableHead>
          <TableHead className="text-[hsl(var(--mk-muted))]">Schedule</TableHead>
          <TableHead className="text-[hsl(var(--mk-muted))]">Inbox</TableHead>
          <TableHead className="text-[hsl(var(--mk-muted))]">Analytics</TableHead>
          <TableHead className="text-[hsl(var(--mk-muted))]">Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.network} className="border-[hsl(var(--mk-border))]">
            <TableCell className="font-medium text-[hsl(var(--mk-ink))]">{row.network}</TableCell>
            <TableCell><CapabilityMark enabled={row.publish} /></TableCell>
            <TableCell><CapabilityMark enabled={row.schedule} /></TableCell>
            <TableCell><CapabilityMark enabled={row.inbox} /></TableCell>
            <TableCell><CapabilityMark enabled={row.analytics} /></TableCell>
            <TableCell>
              <Badge variant="outline" className="border-[hsl(var(--mk-border))] text-[hsl(var(--mk-muted))]">{row.note}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
