import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { User } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface StartShiftModalProps {
  user: User;
  onClose: () => void;
}

const StartShiftModal: React.FC<StartShiftModalProps> = ({ user, onClose }) => {
  const { startShift } = useData();
  const [startCash, setStartCash] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      startShift(user, startCash);
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Start New Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <label htmlFor="startCash" className="text-sm font-medium text-slate-300">Opening Cash Amount</label>
            <Input 
              id="startCash"
              type="number"
              value={startCash}
              onChange={(e) => setStartCash(Number(e.target.value))}
              required
              autoFocus
              className="mt-2 text-lg text-right"
              min="0"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Start Shift</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StartShiftModal;
