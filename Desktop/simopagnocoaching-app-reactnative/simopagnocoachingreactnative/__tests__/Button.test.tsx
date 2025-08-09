import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Button from '@/components/ui/Button';

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button with title', () => {
    render(<Button title="Test Button" onPress={mockOnPress} />);
    
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    render(<Button title="Test Button" onPress={mockOnPress} />);
    
    fireEvent.press(screen.getByText('Test Button'));
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should render primary variant by default', () => {
    render(<Button title="Test Button" onPress={mockOnPress} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render secondary variant', () => {
    render(<Button title="Test Button" onPress={mockOnPress} variant="secondary" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render outline variant', () => {
    render(<Button title="Test Button" onPress={mockOnPress} variant="outline" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render ghost variant', () => {
    render(<Button title="Test Button" onPress={mockOnPress} variant="ghost" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render small size', () => {
    render(<Button title="Test Button" onPress={mockOnPress} size="small" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render medium size', () => {
    render(<Button title="Test Button" onPress={mockOnPress} size="medium" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render large size', () => {
    render(<Button title="Test Button" onPress={mockOnPress} size="large" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render with left icon', () => {
    render(<Button title="Test Button" onPress={mockOnPress} icon="arrow-back" iconPosition="left" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render with right icon', () => {
    render(<Button title="Test Button" onPress={mockOnPress} icon="arrow-forward" iconPosition="right" />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button title="Test Button" onPress={mockOnPress} disabled={true} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
    
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<Button title="Test Button" onPress={mockOnPress} loading={true} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<Button title="Test Button" onPress={mockOnPress} style={customStyle} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render with custom text style', () => {
    const customTextStyle = { color: 'blue' };
    render(<Button title="Test Button" onPress={mockOnPress} textStyle={customTextStyle} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render with full width', () => {
    render(<Button title="Test Button" onPress={mockOnPress} fullWidth={true} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render with rounded corners', () => {
    render(<Button title="Test Button" onPress={mockOnPress} rounded={true} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('should render with shadow', () => {
    render(<Button title="Test Button" onPress={mockOnPress} shadow={true} />);
    
    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });
});
