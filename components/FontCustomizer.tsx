import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Style {
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  fontFamily?: string;
}

interface FontCustomizerProps {
  style: Style;
  onStyleChange: (newStyle: Style) => void;
  label: string;
}

const fontFamilies = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Roboto', value: 'Roboto, Arial, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, Arial, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Poppins', value: 'Poppins, Arial, sans-serif' },
  { label: 'Lato', value: 'Lato, Arial, sans-serif' },
  { label: 'Nunito', value: 'Nunito, Arial, sans-serif' },
];

export default function FontCustomizer({ style, onStyleChange, label }: FontCustomizerProps) {
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  const fontWeights = ['normal', 'bold', '500', '600', '700'];
  const fontStyles = ['normal', 'italic'];

  const handleChange = (field: keyof Style, value: string) => {
    console.log(`Changing ${field} to ${value}`);
    const updatedStyle = {
      ...style,
      [field]: value
    };
    console.log('Updated style:', updatedStyle);
    onStyleChange(updatedStyle);
  };

  return (
    <Card className="p-4 mb-4">
      <h3 className="font-semibold mb-3">{label} Font Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Font Family</Label>
          <Select
            value={style.fontFamily || fontFamilies[0].value}
            onValueChange={(value) => handleChange('fontFamily', value)}
          >
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select font family" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300">
              {fontFamilies.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Font Size</Label>
          <Select
            value={style.fontSize}
            onValueChange={(value) => handleChange('fontSize', value)}
          >
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300">
              {fontSizes.map(size => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Font Weight</Label>
          <Select
            value={style.fontWeight}
            onValueChange={(value) => handleChange('fontWeight', value)}
          >
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select font weight" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300">
              {fontWeights.map(weight => (
                <SelectItem key={weight} value={weight}>{weight}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Font Style</Label>
          <Select
            value={style.fontStyle}
            onValueChange={(value) => handleChange('fontStyle', value)}
          >
            <SelectTrigger className="w-full bg-white border border-gray-300">
              <SelectValue placeholder="Select font style" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300">
              {fontStyles.map(style => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label>Color</Label>
          <Input
            type="color"
            value={style.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="h-9 w-full"
          />
        </div>
      </div>
    </Card>
  );
} 