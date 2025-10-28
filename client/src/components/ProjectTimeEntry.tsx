import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const projects = [
  { id: '1', name: 'Project Alpha' },
  { id: '2', name: 'Project Beta' },
  { id: '3', name: 'Project Gamma' },
  { id: '4', name: 'Internal - Admin' },
];

export function ProjectTimeEntry() {
  const [selectedProject, setSelectedProject] = useState('');
  const [hours, setHours] = useState('');

  const handleSubmit = () => {
    if (!selectedProject || !hours) {
      toast.error('Please select a project and enter hours');
      return;
    }
    toast.success(`${hours} hours logged to project`);
    setSelectedProject('');
    setHours('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Log Project Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label>Project</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Hours</Label>
          <Input
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g., 4.5"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full h-11">
          Log Time
        </Button>
      </CardContent>
    </Card>
  );
}
