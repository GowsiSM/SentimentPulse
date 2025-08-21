import React from 'react';
import Button from '../../../components/ui/Button';

const ProcessingActions = ({ 
  onViewPartialResults, 
  onPauseProcessing, 
  onCancelProcessing,
  hasPartialResults,
  isProcessing,
  isPaused 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Processing Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={onViewPartialResults}
          disabled={!hasPartialResults}
          iconName="Eye"
          iconPosition="left"
          iconSize={16}
          className="justify-start"
        >
          View Partial Results
        </Button>
        
        <Button
          variant={isPaused ? "default" : "outline"}
          onClick={onPauseProcessing}
          disabled={!isProcessing && !isPaused}
          iconName={isPaused ? "Play" : "Pause"}
          iconPosition="left"
          iconSize={16}
          className="justify-start"
        >
          {isPaused ? "Resume Processing" : "Pause Processing"}
        </Button>
        
        <Button
          variant="destructive"
          onClick={onCancelProcessing}
          iconName="X"
          iconPosition="left"
          iconSize={16}
          className="justify-start"
        >
          Cancel Analysis
        </Button>
      </div>
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> You can view partial results at any time during processing. 
          Pausing will preserve current progress and allow you to resume later.
        </p>
      </div>
    </div>
  );
};

export default ProcessingActions;