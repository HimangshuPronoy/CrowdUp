"use client";

import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Filter, TrendingUp, Clock, MessageSquare, Flame, Zap } from "lucide-react";

interface FilterBarProps {
  selectedType: string;
  selectedSort: string;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: string) => void;
}

export default function FilterBar({
  selectedType,
  selectedSort,
  onTypeChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>

      {/* Post Type Filter */}
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Bug Report">🐛 Bug Reports</SelectItem>
          <SelectItem value="Feature Request">💡 Feature Requests</SelectItem>
          <SelectItem value="Complaint">⚠️ Complaints</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Filter */}
      <Select value={selectedSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popular">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Best (Smart Feed)
            </div>
          </SelectItem>
          <SelectItem value="hot">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Hot (Viral)
            </div>
          </SelectItem>
          <SelectItem value="recent">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              New
            </div>
          </SelectItem>
          <SelectItem value="discussed">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Most Discussed
            </div>
          </SelectItem>
          <SelectItem value="controversial">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Controversial
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Button */}
      {(selectedType !== "all" || selectedSort !== "recent") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onTypeChange("all");
            onSortChange("recent");
          }}
          className="text-orange-500 hover:text-orange-600"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
}
