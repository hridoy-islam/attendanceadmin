import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import TaskList from './task-list';
import { useToast } from '../ui/use-toast';

export default function DueTasks({ user }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const fetchDueTasks = async () => {
    const response = await axiosInstance(`/task/duetasks/${user._id}`);
    setTasks(response.data.data);
  };

  useEffect(() => {
    fetchDueTasks();
  }, [user]);

  const handleMarkAsImportant = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(
      `/task/${taskId}`,
      { important: !task.important } // Toggle important status
    );

    if (response.data.success) {
      fetchDueTasks();
      toast({
        title: 'Task Updated',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  const handleToggleTaskCompletion = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(`/task/${taskId}`, {
      status: task?.status === 'completed' ? 'pending' : 'completed'
    });

    if (response.data.success) {
      fetchDueTasks();
      toast({
        title: 'Task Updated',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  const handleNewTaskSubmit = async (data) => {
    data.author = user?._id;
    const response = await axiosInstance.post(`/task`, data);
    if (response.data.success) {
      fetchDueTasks();
      toast({
        title: 'Task Added',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Due Tasks</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <TaskList
          tasks={tasks}
          onMarkAsImportant={handleMarkAsImportant}
          onToggleTaskCompletion={handleToggleTaskCompletion}
          onNewTaskSubmit={handleNewTaskSubmit}
          showAddTaskForm={false} // Set to true to show the add task form
          fetchTasks={fetchDueTasks}
        />
      </CardContent>
    </Card>
  );
}
