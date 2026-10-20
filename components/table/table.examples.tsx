import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table.js';

function TableProjects() {
  return (
    <Table>
      <caption>Active projects</caption>
      <TableHeader sticky>
        <TableRow>
          <TableHead scope="col">Project</TableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <a href="#sapphire">Sapphire</a>
          </TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function TableFinancial() {
  return (
    <Table data-variant="financial">
      <caption>Monthly revenue</caption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Service</TableHead>
          <TableHead scope="col">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Consultancy</TableCell>
          <TableCell>RM 8,000</TableCell>
        </TableRow>
        <TableRow data-row="total">
          <TableCell>Total</TableCell>
          <TableCell>RM 8,000</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export const examples = [
  { name: 'projects', render: TableProjects },
  { name: 'financial', render: TableFinancial },
] as const;
