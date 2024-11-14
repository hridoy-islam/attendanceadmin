import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import DynamicPagination from '@/components/shared/DynamicPagination';
import { Input } from '@/components/ui/input';
import axiosInstance from '../../../lib/axios';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Switch } from '@/components/ui/switch';

export default function UserTableList({ refreshKey }) {
  const { user } = useSelector((state: any) => state.auth);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(
    async (page, entriesPerPage, searchTerm = '') => {
      try {
        let endpoint = `/users?role=user&page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}`;
        const res = await axiosInstance.get(endpoint);
        setUsers(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
      } finally {
      }
    },
    [user]
  );

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage, searchTerm, refreshKey, fetchData]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleEntriesPerPageChange = (event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  const toggleIsDeleted = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await axiosInstance.patch(`/users/${userId}`, {
        isDeleted: !currentStatus
      });
      if (res.data.success) {
        fetchData(currentPage, entriesPerPage, searchTerm);
        toast({
          title: 'Updated Successfully',
          description: 'Thank You'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating user',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="relative h-[80vh]">
        <div className="mb-6 flex gap-10">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            className="block w-[180px] rounded-md border border-gray-300 bg-white p-2 shadow-sm transition  duration-150 ease-in-out focus:border-black focus:outline-none focus:ring-black"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>User Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((stuff: any) => (
              <TableRow key={stuff._id}>
                <TableCell>{stuff?.name}</TableCell>
                <TableCell>{stuff?.email}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`user/report/${stuff._id}`}>
                      <Button variant="outline" size="sm">
                        Check Attendance
                      </Button>
                    </Link>
                  </div>
                </TableCell>

                <TableCell className="flex items-center">
                  <Switch
                    checked={stuff?.isDeleted}
                    onCheckedChange={() =>
                      toggleIsDeleted(stuff?._id, stuff?.isDeleted)
                    }
                  />
                  <span
                    className={`ml-1 font-semibold ${stuff.isDeleted ? 'text-red-500' : 'text-green-500'}`}
                  >
                    {stuff.isDeleted ? 'Inactive' : 'Active'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="absolute bottom-0 w-full">
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
}
