/**
 * Mock response generator for Nova AI Chat Widget
 * Generates contextual responses based on user input keywords
 * This will be replaced with actual API calls in backend integration phase
 */

export const getMockResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  // Equipment location queries
  if (lowerMessage.includes('where') || lowerMessage.includes('find')) {
    if (lowerMessage.includes('esp32')) {
      return "I found 5 ESP32 development boards:\n• 3 available in Cabinet B, Drawer 3, Room 102\n• 2 checked out (returning tomorrow)";
    }
    if (lowerMessage.includes('arduino')) {
      return "I found 8 Arduino Uno boards:\n• 5 available in Cabinet B, Drawer 2, Room 102\n• 3 checked out";
    }
    if (lowerMessage.includes('resistor')) {
      return "Resistors are located in Cabinet A, Drawer 1, Room 101. Stock: 150 available.";
    }
    if (lowerMessage.includes('oscilloscope')) {
      return "Oscilloscopes are in Lab Bench 3, Room 201. Currently: 2 available, 1 in maintenance.";
    }
    if (lowerMessage.includes('multimeter')) {
      return "Digital Multimeters are in Tool Cabinet A, Room 101. Available: 6 out of 8 units.";
    }
    return "Could you specify which equipment you're looking for? I can help locate:\n• Microcontrollers\n• Tools & Instruments\n• Components\n• Other equipment";
  }

  // Availability queries
  if (lowerMessage.includes('available') || lowerMessage.includes('availability')) {
    return "Here's a quick availability summary:\n\n✅ Arduino Uno: 5 available\n✅ Raspberry Pi 4: 2 available\n✅ Oscilloscope: 2 available\n✅ Multimeter: 6 available\n⚠️ Soldering Iron: 0 available (In Maintenance)\n\nWhat would you like to reserve?";
  }

  // Reservation queries
  if (lowerMessage.includes('reserve') || lowerMessage.includes('book') || lowerMessage.includes('checkout')) {
    return "I can help you make a reservation! Which equipment and when do you need it?\n\nExamples:\n• 'Reserve Arduino for Friday 2pm'\n• 'Book oscilloscope for tomorrow'";
  }

  // Voltage measurement
  if (lowerMessage.includes('measure voltage') || lowerMessage.includes('voltage measurement')) {
    return "For voltage measurement, I recommend:\n\n1. Digital Multimeter (6 available, Tool Cabinet A, Room 101)\n2. Oscilloscope (2 available, Lab Bench 3, Room 201)\n\nWhich would you prefer?";
  }

  // Equipment recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('help me')) {
    return "I can help! Tell me about your project:\n• Are you working with microcontrollers?\n• Do you need measurement tools?\n• Are you testing circuits?\n\nThis will help me suggest the right equipment.";
  }

  // Maintenance checks
  if (lowerMessage.includes('maintenance') || lowerMessage.includes('broken') || lowerMessage.includes('repair')) {
    return "For maintenance issues, please contact the lab technician. Current maintenance requests:\n• Soldering Iron: In maintenance (expected back 2/26)\n\nWould you like to file a maintenance request?";
  }

  // Checkout history
  if (lowerMessage.includes('history') || lowerMessage.includes('past') || lowerMessage.includes('previous')) {
    return "Your recent checkouts:\n• Arduino Uno - Returned 2/20\n• Multimeter - Returned 2/19\n• Resistor Kit - Returned 2/18\n\nWould you like details on any of these?";
  }

  // Default helpful response
  return "I'm here to help you with lab equipment! Try asking:\n• 'Where is the [equipment]?'\n• 'What's available?'\n• 'Reserve [equipment] for [date]'\n• 'Measure voltage'\n\nWhat can I help you with today?";
};

export interface ResponseAction {
  label: string;
  onClick: () => void;
}

export const getResponseActions = (userMessage: string): ResponseAction[] | null => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('esp32') || lowerMessage.includes('arduino')) {
    return [
      {
        label: 'View Details',
        onClick: () => console.log('View details clicked for equipment'),
      },
      {
        label: 'Reserve',
        onClick: () => console.log('Reserve clicked'),
      },
    ];
  }

  if (lowerMessage.includes('measure voltage')) {
    return [
      {
        label: 'Use Multimeter',
        onClick: () => console.log('Multimeter selected'),
      },
      {
        label: 'Use Oscilloscope',
        onClick: () => console.log('Oscilloscope selected'),
      },
    ];
  }

  if (lowerMessage.includes('available')) {
    return [
      {
        label: 'View All Equipment',
        onClick: () => console.log('View all equipment'),
      },
      {
        label: 'Quick Reserve',
        onClick: () => console.log('Quick reserve initiated'),
      },
    ];
  }

  return null;
};
