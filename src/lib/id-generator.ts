// Utility function to generate custom user IDs
// This is mainly for reference - the actual ID generation happens in the database

export function generateUserId(sequenceNumber: number): string {
  return `tradesetu${sequenceNumber.toString().padStart(3, '0')}`;
}

// Example usage:
// generateUserId(1) -> "tradesetu001"
// generateUserId(42) -> "tradesetu042"
// generateUserId(999) -> "tradesetu999"
