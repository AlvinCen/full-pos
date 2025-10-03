import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { CashMovementType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CashMovementModalProps {
  type: CashMovementType;
  onClose: () => void;
}

const CashMovementModal: React.FC<CashMovementModalProps> = ({ type, onClose }) => {
  const { addCashMovement } = useData();
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
        alert("Amount must be greater than zero.");
        return;
    }
    if (!notes.trim()){
        alert("Notes are required for cash movements.");
        return;
    }

    try {
      addCashMovement(type, amount, notes);
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };
  
  const title = type === CashMovementType.IN ? 'Record Cash In' : 'Record Cash Out';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label htmlFor="amount" className="text-sm font-medium text-slate-300">Amount</label>
                <Input 
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  autoFocus
                  className="mt-2 text-lg text-right"
                  min="0.01"
                  step="0.01"
                />
            </div>
            <div>
                <label htmlFor="notes" className="text-sm font-medium text-slate-300">Notes / Reason</label>
                <Input 
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                  className="mt-2"
                  placeholder={type === 'IN' ? 'e.g., Add change' : 'e.g., Office supplies'}
                />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Movement</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CashMovementModal;
