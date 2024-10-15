import { useState, useEffect } from 'react';
import { createFileRoute } from "@tanstack/react-router"
import { Box, Container, Text, Input, Button, VStack, HStack, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IcalService } from '../../client';
import useAuth from '../../hooks/useAuth';

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  const { user: currentUser } = useAuth();
  const [icalUrl, setIcalUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: icalData, isLoading, isError } = useQuery({
    queryKey: ['ical', currentUser?.id],
    queryFn: IcalService.readMyIcal,
    retry: false,
    enabled: !!currentUser?.id,
  });

  const createIcalMutation = useMutation({
    mutationFn: (url: string) => IcalService.createMyIcal({ requestBody: { ical_url: url } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ical'] });
      toast({
        title: 'iCal URL set successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error setting iCal URL',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateIcalMutation = useMutation({
    mutationFn: (url: string) => IcalService.updateMyIcal({ requestBody: { ical_url: url } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ical'] });
      toast({
        title: 'iCal URL updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating iCal URL',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    if (icalData) {
      setIcalUrl(icalData.ical_url);
      if (currentUser) {
        setProxyUrl(`localhost:8000/api/v1/proxy/${currentUser.id}`); // TODO: Update with actual proxy URL
      }
    } else {
      setProxyUrl('');
    }
  }, [icalData, currentUser]);

  const handleSetIcalUrl = () => {
    if (icalData) {
      updateIcalMutation.mutate(icalUrl);
    } else {
      createIcalMutation.mutate(icalUrl);
    }
  };

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <Container maxW="full">
      <Box pt={12} m={4}>
        <Text fontSize="2xl">Hi, {currentUser?.email} 👋🏼</Text>
        <Text mb={4}>Welcome back, nice to see you again!</Text>

        <VStack spacing={4} align="stretch">
          {isError && (
            <Alert status="info">
              <AlertIcon />
              You haven't set up your iCal URL yet. Please enter it below to get started.
            </Alert>
          )}

          <Box>
            <Text fontWeight="bold" mb={2}>{icalData ? 'Update your iCal URL:' : 'Set your iCal URL:'}</Text>
            <HStack>
              <Input 
                value={icalUrl} 
                onChange={(e) => setIcalUrl(e.target.value)}
                placeholder="Enter your iCal URL"
              />
              <Button 
                onClick={handleSetIcalUrl}
                isLoading={createIcalMutation.isPending || updateIcalMutation.isPending}
              >
                {icalData ? 'Update' : 'Set'} URL
              </Button>
            </HStack>
          </Box>

          {proxyUrl && (
            <Box>
              <Text fontWeight="bold" mb={2}>Your Proxy iCal URL:</Text>
              <Input value={proxyUrl} isReadOnly />
            </Box>
          )}
        </VStack>
      </Box>
    </Container>
  );
}