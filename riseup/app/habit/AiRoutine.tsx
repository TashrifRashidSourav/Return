import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Task = {
  start: string;
  end: string;
  task: string;
  priority: number;
};

const API_URL = 'http://10.15.56.133:5000/airesponse';

const AiResponseApp = () => {
  const [schedule, setSchedule] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({ start: '', end: '', task: '', priority: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSchedule(response.data.schedule);
    } catch (err) {
      setError('Failed to fetch schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/update`,
        { tasks: schedule },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchedule(response.data.schedule);
    } catch (err) {
      setError('Failed to update schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/add-task`,
        { newTask },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchedule(response.data.schedule);
      setNewTask({ start: '', end: '', task: '', priority: 0 });
    } catch (err) {
      setError('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Response Schedule Manager</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add a New Task</h2>
        <div className="grid grid-cols-4 gap-4">
          <input
            type="time"
            name="start"
            value={newTask.start}
            onChange={handleInputChange}
            className="border p-2"
            placeholder="Start Time"
          />
          <input
            type="time"
            name="end"
            value={newTask.end}
            onChange={handleInputChange}
            className="border p-2"
            placeholder="End Time"
          />
          <input
            type="text"
            name="task"
            value={newTask.task}
            onChange={handleInputChange}
            className="border p-2"
            placeholder="Task Description"
          />
          <input
            type="number"
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
            className="border p-2"
            placeholder="Priority"
          />
        </div>
        <button
          onClick={addTask}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Schedule</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {schedule.map((item, index) => (
              <li
                key={index}
                className="border p-4 rounded shadow-md flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {item.start} - {item.end}
                  </p>
                  <p>{item.task}</p>
                  <p className="text-sm text-gray-600">Priority: {item.priority}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={updateSchedule}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Update Schedule
      </button>
    </div>
  );
};

export default AiResponseApp;
