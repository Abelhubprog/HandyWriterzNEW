import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  postCount: number;
}

const TagsList: React.FC = () => {
  const tags: Tag[] = [
    { id: '1', name: 'Essay Writing', slug: 'essay-writing', color: 'blue', postCount: 25 },
    { id: '2', name: 'Research Methods', slug: 'research-methods', color: 'green', postCount: 18 },
    { id: '3', name: 'Citation', slug: 'citation', color: 'purple', postCount: 12 },
    { id: '4', name: 'Academic', slug: 'academic', color: 'orange', postCount: 35 },
    { id: '5', name: 'Nursing', slug: 'nursing', color: 'red', postCount: 22 }
  ];

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-1">Manage content tags</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge className={getColorClass(tag.color)}>
                    {tag.name}
                  </Badge>
                  <div>
                    <p className="text-sm text-gray-600">Slug: {tag.slug}</p>
                    <p className="text-sm text-gray-500">{tag.postCount} posts</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TagsList;