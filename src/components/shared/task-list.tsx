import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Star,
  UserRoundCheck,
  Calendar,
  CornerDownLeft,
  ArrowRight,
  CircleUser,
  MessageSquareText
} from 'lucide-react';

import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import TaskDetails from './task-details';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { AlertModal } from './alert-modal';
import { toast } from '../ui/use-toast';

const TaskList = ({
  tasks,
  onMarkAsImportant,
  onToggleTaskCompletion,
  onNewTaskSubmit,
  showAddTaskForm,
  fetchTasks
}) => {
  const { user } = useSelector((state: any) => state.auth);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const [openUpdate, setOpenUpdate] = useState(false);
  const [updatedData, setUpdatedData] = useState({ dueDate: '', taskName: '' });
  const [loading, setLoading] = useState(false);

  const sortedTasks = tasks?.sort((a, b) => {
    return a.status === 'completed' && b.status === 'pending' ? 1 : -1;
  });

  const onSubmit = async (data) => {
    await onNewTaskSubmit(data);
    reset();
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const closeTaskDetails = () => {
    setTaskDetailsOpen(false);
    setSelectedTask(null); // Clear the selected task
  };

  const openUpdateModal = (task) => {
    setUpdatedData({
      dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : '',
      taskName: task.taskName || ''
    });
    setOpenUpdate(true);
    setSelectedTask(task);
  };

  const onUpdateConfirm = async (data) => {
    setLoading(true);
    try {
      const dueDateUTC = moment(data.dueDate).utc().toISOString();
      const res = await axiosInstance.patch(`/task/${selectedTask?._id}`, {
        dueDate: dueDateUTC,
        taskName: data.taskName
      });
      if (res.data.success) {
        fetchTasks(); // Refresh tasks
        setOpenUpdate(false); // Close modal after update
        toast({
          title: 'Task Updated Successfully',
          description: 'Thank You'
        });
        reset();
      } else {
        console.error('');
        toast({
          title: 'Failed to update due date',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating due date:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="flex-1 overflow-auto p-4">
        <ScrollArea className="h-[calc(85vh-8rem)]">
          <div className="space-y-2">
            {sortedTasks?.map((task) => (
              <div
                key={task._id}
                className={`flex items-center space-x-2 rounded-lg bg-white p-3 shadow ${
                  task.important ? 'bg-yellow-100' : ''
                }`}
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => onToggleTaskCompletion(task._id)}
                  disabled={task.author?._id !== user?._id}
                />
                <span
                  className={`flex-1 ${
                    task.status === 'completed'
                      ? 'text-gray-500 line-through'
                      : ''
                  }`}
                  onClick={() => {
                    if (task.author?._id === user?._id) {
                      openUpdateModal(task);
                    } else {
                      toast({
                        title: `Please Contact with ${task?.author.name}`,
                        description:
                          'You do not have permission for this action',
                        variant: 'destructive'
                      });
                    }
                  }}
                >
                  {task.taskName}
                </span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-indigo-600"
                      >
                        <UserRoundCheck className="h-3 w-3" />
                        {task.author.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Created By {task.author.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Badge variant="outline" className={'bg-black'}>
                  <ArrowRight className="h-3 w-3 " />
                </Badge>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-sky-600"
                      >
                        <CircleUser className="h-3 w-3" />
                        {task?.assigned?.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assigned To {task?.assigned?.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant={'outline'}
                        className="flex items-center gap-1 bg-red-700 text-white"
                        // onClick={() => openUpdateModal(task)}
                        onClick={() => {
                          if (task.author?._id === user?._id) {
                            openUpdateModal(task);
                          } else {
                            toast({
                              title: `Please Contact with ${task?.author.name}`,
                              description:
                                'You do not have permission for this action',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <Calendar className="h-3 w-3" />
                        {moment(task.dueDate).format('MMM Do YYYY')}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Deadline</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant={null}
                        size="icon"
                        onClick={() => onMarkAsImportant(task._id)}
                      >
                        <Star
                          className={`h-4 w-4 ${task.important ? 'text-orange-600' : ''}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {task.important
                          ? 'Unmark as Important'
                          : 'Mark As Important'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant={null}
                        size="icon"
                        onClick={() => openTaskDetails(task)}
                      >
                        <MessageSquareText
                          className={`h-4 w-4 text-cyan-900`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Comments</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </ScrollArea>
      </main>

      {isTaskDetailsOpen && selectedTask !== null && (
        <TaskDetails
          task={selectedTask}
          isOpen={isTaskDetailsOpen}
          onOpenChange={closeTaskDetails}
        />
      )}

      <AlertModal
        isOpen={openUpdate}
        onClose={() => setOpenUpdate(false)}
        onConfirm={handleSubmit(onUpdateConfirm)}
        loading={loading}
        title={`Update Due Date`}
        description={`Edit the due date of the task.`}
      >
        <form>
          <Input
            {...register('taskName', { required: true })} // Register the name field
            type="text"
            defaultValue={updatedData.taskName} // Use defaultValue for controlled input
            className="mb-4"
            placeholder="Task Name"
          />

          <Input
            type="date"
            defaultValue={updatedData.dueDate}
            {...register('dueDate', { required: true })}
            className="mb-4"
          />
        </form>
      </AlertModal>

      {showAddTaskForm && (
        <footer className="bg-white p-4 shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
            <Input
              {...register('taskName', { required: true })}
              type="text"
              placeholder="Add a task"
              className="flex-1"
            />
            <Button type="submit" variant={'outline'}>
              <CornerDownLeft className="mr-2 h-4 w-4" />
            </Button>
          </form>
        </footer>
      )}
    </div>
  );
};

export default TaskList;
