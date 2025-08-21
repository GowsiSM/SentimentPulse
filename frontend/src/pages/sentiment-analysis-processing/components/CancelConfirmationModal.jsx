import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-modal max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-destructive/10 rounded-full">
              <Icon name="AlertTriangle" size={24} className="text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Cancel Analysis</h3>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Are you sure you want to cancel the sentiment analysis for "{productName}"? 
            This will stop all processing and you will lose the current progress.
          </p>
          
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Keep Processing
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              iconName="X"
              iconPosition="left"
              iconSize={16}
            >
              Cancel Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;