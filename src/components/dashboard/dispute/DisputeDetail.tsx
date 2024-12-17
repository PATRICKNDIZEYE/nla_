import AppealStatusDisplay from './AppealStatusDisplay';
// ... existing imports ...

const DisputeDetail: React.FC = () => {
  // ... existing code ...

  return (
    <div>
      {/* Add AppealStatusDisplay at the top of the detail view */}
      {data?.upiNumber && (
        <AppealStatusDisplay upiNumber={data.upiNumber} />
      )}
      
      {/* ... rest of existing detail view code ... */}
    </div>
  );
};

export default DisputeDetail; 