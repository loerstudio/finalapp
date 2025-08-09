import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Input from '@/components/ui/Input';

describe('Input', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input with label', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} />);
    
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('should render input with placeholder', () => {
    render(<Input label="Email" placeholder="Enter your email" value="" onChangeText={mockOnChangeText} />);
    
    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.changeText(input, 'test@test.com');
    
    expect(mockOnChangeText).toHaveBeenCalledWith('test@test.com');
  });

  it('should render with icon', () => {
    render(<Input label="Email" icon="mail" value="" onChangeText={mockOnChangeText} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with error message', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} error="Invalid email" />);
    
    expect(screen.getByText('Invalid email')).toBeTruthy();
  });

  it('should render with helper text', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} helper="We'll never share your email" />);
    
    expect(screen.getByText('We\'ll never share your email')).toBeTruthy();
  });

  it('should render with required indicator', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} required={true} />);
    
    expect(screen.getByText('Email *')).toBeTruthy();
  });

  it('should render with disabled state', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} disabled={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with secure text entry', () => {
    render(<Input label="Password" value="" onChangeText={mockOnChangeText} secureTextEntry={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with auto capitalize', () => {
    render(<Input label="Name" value="" onChangeText={mockOnChangeText} autoCapitalize="words" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with auto correct disabled', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} autoCorrect={false} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with keyboard type', () => {
    render(<Input label="Phone" value="" onChangeText={mockOnChangeText} keyboardType="phone-pad" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with max length', () => {
    render(<Input label="Code" value="" onChangeText={mockOnChangeText} maxLength={6} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with multiline', () => {
    render(<Input label="Description" value="" onChangeText={mockOnChangeText} multiline={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { borderColor: 'red' };
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} style={customStyle} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with custom input style', () => {
    const customInputStyle = { fontSize: 18 };
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} inputStyle={customInputStyle} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with custom label style', () => {
    const customLabelStyle = { color: 'blue' };
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} labelStyle={customLabelStyle} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with left icon', () => {
    render(<Input label="Search" value="" onChangeText={mockOnChangeText} leftIcon="search" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with right icon', () => {
    render(<Input label="Password" value="" onChangeText={mockOnChangeText} rightIcon="eye" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with clear button', () => {
    render(<Input label="Email" value="test@test.com" onChangeText={mockOnChangeText} clearButton={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with loading state', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} loading={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with success state', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} success={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should render with warning state', () => {
    render(<Input label="Email" value="" onChangeText={mockOnChangeText} warning={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
  });
});
