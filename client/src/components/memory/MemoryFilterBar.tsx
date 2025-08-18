import React, { useState, useCallback } from 'react';
import { 
  Chip, 
  TextField, 
  Autocomplete, 
  Box, 
  Paper, 
  Typography, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Filter, Calendar, Tag, MapPin } from 'lucide-react';

interface MemoryFilters {
  emotions: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  event: string | null;
  location: string | null;
}

interface MemoryFilterBarProps {
  filters: MemoryFilters;
  onFiltersChange: (filters: MemoryFilters) => void;
  availableEvents?: Array<{ id: string; title: string }>;
}

const EMOTION_TAGS = [
  'joy', 'passion', 'connection', 'gratitude', 'bliss', 'harmony',
  'growth', 'learning', 'breakthrough', 'appreciation', 'musical',
  'spiritual', 'intense', 'vulnerable', 'trust', 'sacred'
];

export default function MemoryFilterBar({ 
  filters, 
  onFiltersChange, 
  availableEvents = [] 
}: MemoryFilterBarProps) {
  const handleEmotionTagsChange = useCallback((newChips: string[]) => {
    onFiltersChange({
      ...filters,
      emotions: newChips
    });
  }, [filters, onFiltersChange]);

  const handleDateStartChange = useCallback((date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start: date
      }
    });
  }, [filters, onFiltersChange]);

  const handleDateEndChange = useCallback((date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        end: date
      }
    });
  }, [filters, onFiltersChange]);

  const handleEventChange = useCallback((event: any) => {
    onFiltersChange({
      ...filters,
      event: event.target.value
    });
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    onFiltersChange({
      emotions: [],
      dateRange: { start: null, end: null },
      event: null,
      location: null
    });
  }, [onFiltersChange]);

  const hasActiveFilters = filters.emotions.length > 0 || 
                         filters.dateRange.start || 
                         filters.dateRange.end || 
                         filters.event;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Filter className="w-5 h-5 text-indigo-600 mr-2" />
          <Typography variant="h6" component="h3" sx={{ 
            fontWeight: 600, 
            color: '#1e293b',
            mr: 2
          }}>
            Filter Memories
          </Typography>
          {hasActiveFilters && (
            <Chip 
              label="Clear All" 
              variant="outlined" 
              size="small"
              onClick={clearFilters}
              sx={{ 
                borderColor: '#6366f1',
                color: '#6366f1',
                '&:hover': {
                  backgroundColor: '#f1f5f9'
                }
              }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Emotion Tags Filter */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Tag className="w-4 h-4 text-pink-500 mr-2" />
              <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#374151' }}>
                Emotion Tags
              </Typography>
            </Box>
            <MuiChipsInput
              value={filters.emotions}
              onChange={handleEmotionTagsChange}
              placeholder="Add emotion tags..."
              size="small"
              fullWidth
              sx={{
                '& .MuiChip-root': {
                  backgroundColor: '#fce7f3',
                  color: '#be185d',
                  '&:hover': {
                    backgroundColor: '#fbcfe8'
                  }
                }
              }}
              renderChip={(Component, key, props) => (
                <Component
                  key={key}
                  {...props}
                  size="small"
                  variant="filled"
                />
              )}
            />
            <Box sx={{ mt: 1 }}>
              {EMOTION_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (!filters.emotions.includes(tag)) {
                      handleEmotionTagsChange([...filters.emotions, tag]);
                    }
                  }}
                  sx={{
                    mr: 0.5,
                    mb: 0.5,
                    fontSize: '0.75rem',
                    height: '24px',
                    borderColor: filters.emotions.includes(tag) ? '#be185d' : '#d1d5db',
                    backgroundColor: filters.emotions.includes(tag) ? '#fce7f3' : 'transparent',
                    color: filters.emotions.includes(tag) ? '#be185d' : '#6b7280',
                    '&:hover': {
                      borderColor: '#be185d',
                      backgroundColor: '#fce7f3'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Event Filter */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Calendar className="w-4 h-4 text-blue-500 mr-2" />
              <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#374151' }}>
                Event
              </Typography>
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Select Event</InputLabel>
              <Select
                value={filters.event || ''}
                onChange={handleEventChange}
                label="Select Event"
                sx={{
                  '& .MuiSelect-select': {
                    color: '#374151'
                  }
                }}
              >
                <MenuItem value="">
                  <em>All Events</em>
                </MenuItem>
                {availableEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range Filter */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Calendar className="w-4 h-4 text-green-500 mr-2" />
              <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#374151' }}>
                Date Range
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange.start}
                onChange={handleDateStartChange}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    sx: { flex: 1 }
                  } 
                }}
              />
              <DatePicker
                label="End Date"
                value={filters.dateRange.end}
                onChange={handleDateEndChange}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    sx: { flex: 1 }
                  } 
                }}
              />
            </Box>
          </Grid>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <Grid item xs={12}>
              <Box sx={{ 
                pt: 2, 
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center'
              }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 500, 
                  color: '#6b7280',
                  mr: 1
                }}>
                  Active Filters:
                </Typography>
                {filters.emotions.map((emotion) => (
                  <Chip
                    key={emotion}
                    label={emotion}
                    size="small"
                    onDelete={() => {
                      handleEmotionTagsChange(filters.emotions.filter(e => e !== emotion));
                    }}
                    sx={{
                      backgroundColor: '#fce7f3',
                      color: '#be185d'
                    }}
                  />
                ))}
                {filters.event && (
                  <Chip
                    label={`Event: ${availableEvents.find(e => e.id === filters.event)?.title || filters.event}`}
                    size="small"
                    onDelete={() => {
                      onFiltersChange({ ...filters, event: null });
                    }}
                    sx={{
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8'
                    }}
                  />
                )}
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <Chip
                    label={`Date: ${filters.dateRange.start?.toLocaleDateString() || 'Start'} - ${filters.dateRange.end?.toLocaleDateString() || 'End'}`}
                    size="small"
                    onDelete={() => {
                      onFiltersChange({ 
                        ...filters, 
                        dateRange: { start: null, end: null } 
                      });
                    }}
                    sx={{
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}
                  />
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </LocalizationProvider>
  );
}