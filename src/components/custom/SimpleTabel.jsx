/* eslint-disable react/prop-types */
import { Button } from '@/components/ui/button'; // Assuming you have a button component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';

const DynamicTabel = ({
  fieldsToRender,
  data,
  caption,
  handleEdit,
  handleDelete,
}) => {
  return (
    <div>
      <Table>
        <TableCaption>A list of {caption} with actions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">ID</TableHead>
            {fieldsToRender.map((field) => (
              <TableHead className="font-bold" key={field.key}>
                {field.label}
              </TableHead>
            ))}
            <TableHead className="font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              {fieldsToRender.map((field) => (
                <TableCell key={field.key}>
                  {field.key === 'image' ? (
                    <img
                      src={item[field.key]}
                      alt={item.title}
                      width={50}
                      height={50}
                    />
                  ) : (
                    item[field.key]?.toString() || 'N/A'
                  )}
                </TableCell>
              ))}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(item)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DynamicTabel;
