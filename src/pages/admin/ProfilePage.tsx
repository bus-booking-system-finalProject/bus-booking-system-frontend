import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack,
  Grid,
} from '@mui/material';
import { User as UserIcon, Mail, Phone, Edit, Building2, Camera } from 'lucide-react';
import { ProfileApi } from '@/lib/api/admin/ProfileApi';
import type { ProfileDto } from '@/types/admin/ProfileTypes';
import { useToast } from '@/hooks/useToast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiErrorResponse } from '@/types/CommonTypes';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Local form state for the 3 allowed fields
  const [formData, setFormData] = useState<Pick<ProfileDto, 'contactEmail' | 'contactPhone'>>({
    contactEmail: '',
    contactPhone: '',
  });

  // 1. Fetch Profile (Enabled only for OPERATORS)
  const { data: operatorProfile, isLoading: isOpLoading } = useQuery({
    queryKey: ['operatorProfile'],
    queryFn: ProfileApi.getMe,
    enabled: user?.role === 'OPERATOR',
  });

  // 2. Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { req: ProfileDto; file?: File }) =>
      ProfileApi.updateMe(data.req, data.file),
    onSuccess: () => {
      showToast('Profile updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['operatorProfile'] });
      handleCloseDialog();
    },
    onError: (err: ApiErrorResponse) => {
      showToast(err?.message || 'Failed to update profile', 'error');
    },
  });

  const handleEditClick = () => {
    if (operatorProfile) {
      setFormData({
        contactEmail: operatorProfile.contactEmail || '',
        contactPhone: operatorProfile.contactPhone || '',
      });
      setPreviewUrl(operatorProfile.image ?? null);
      setIsEditDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedFile(null);
    // Cleanup the blob URL to save memory
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // Only sending the fields allowed for update
    const updatePayload: ProfileDto = {
      ...operatorProfile, // Keep existing fields if required by DTO
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
    };

    updateProfileMutation.mutate({
      req: updatePayload,
      file: selectedFile || undefined,
    });
  };

  if (!user)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Please log in.</Typography>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid sx={{ xs: 12, md: 4 }}>
          <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar
                src={operatorProfile?.image}
                sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3 }}
              />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {user.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.role}
            </Typography>
          </Card>
        </Grid>

        {/* Detailed Info Card */}
        <Grid sx={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Account Info (General) */}
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Account Details
              </Typography>
              <Stack spacing={2}>
                <InfoRow icon={<Mail size={20} />} label="Email" value={user.email} />
                <InfoRow icon={<UserIcon size={20} />} label="Full Name" value={user.fullName} />
              </Stack>

              {/* Operator Specific Info */}
              {user.role === 'OPERATOR' && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Operator Contact
                    </Typography>
                    <Button startIcon={<Edit size={18} />} onClick={handleEditClick}>
                      Edit
                    </Button>
                  </Box>

                  {isOpLoading ? (
                    <CircularProgress />
                  ) : (
                    <Stack spacing={2}>
                      <InfoRow
                        icon={<Building2 size={20} />}
                        label="Brand Name"
                        value={operatorProfile?.name}
                      />
                      <InfoRow
                        icon={<Mail size={20} />}
                        label="Contact Email"
                        value={operatorProfile?.contactEmail}
                      />
                      <InfoRow
                        icon={<Phone size={20} />}
                        label="Contact Phone"
                        value={operatorProfile?.contactPhone}
                      />
                    </Stack>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Update Contact Info</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={previewUrl || ''}
                variant="rounded"
                sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
              />
              <Button
                component="label"
                size="small"
                variant="outlined"
                startIcon={<Camera size={16} />}
              >
                Upload Logo
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Box>
            <TextField
              label="Contact Email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              fullWidth
            />
            <TextField
              label="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Small helper component for clean layout
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 1.5,
      bgcolor: '#f9f9f9',
      borderRadius: 2,
    }}
  >
    {icon}
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || 'Not provided'}
      </Typography>
    </Box>
  </Box>
);

export default ProfilePage;
