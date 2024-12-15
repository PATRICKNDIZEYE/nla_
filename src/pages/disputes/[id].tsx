import DisputeChat from '@/components/dispute/DisputeChat';

const DisputeDetails: React.FC = () => {
  // ... existing code ...

  return (
    <div>
      {/* ... existing dispute details ... */}
      
      {/* Add chat component */}
      {dispute && session?.user && (
        <DisputeChat
          dispute={dispute}
          currentUser={session.user}
        />
      )}
      
      {/* ... rest of the existing content ... */}
    </div>
  );
};

// ... rest of the existing code ... 