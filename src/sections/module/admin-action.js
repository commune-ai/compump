import * as Yup from 'yup';
import { useEffect } from 'react';
import { writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core';
import { useAccount, useChainId } from 'wagmi';

import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { config } from 'src/config';

import moduleAbi from '../../constant/module.json';

export default function AdminAction({ stats, setUpdater, moduleAddress }) {
  const { address } = useAccount();
  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    emission: Yup.number().min(0, 'Emission must not be below 0').required('Emission is required'),
    logoURL: Yup.string().url('Must be a valid URL').nullable(),
    facebook: Yup.string(),
    linkedin: Yup.string(),
    instagram: Yup.string(),
    twitter: Yup.string(),
  });
  const defaultValues = {
    emission: stats.moduleInfo.emission,
    logoURL: stats.moduleInfo.logoURL,
    facebook: stats.moduleInfo.socials?.filter((social) => social.value === 'facebook')[0]?.path,
    linkedin: stats.moduleInfo.socials?.filter((social) => social.value === 'linkedin')[0]?.path,
    instagram: stats.moduleInfo.socials?.filter((social) => social.value === 'instagram')[0]?.path,
    twitter: stats.moduleInfo.socials?.filter((social) => social.value === 'twitter')[0]?.path,
  };
  const dialog = useBoolean();
  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  useEffect(() => {
    reset({
      emission: stats.moduleInfo.emission, // Update the form with new emission value
      logoURL: stats.moduleInfo.logoURL,
      facebook: stats.moduleInfo.socials?.filter((social) => social.value === 'facebook')[0]?.path,
      linkedin: stats.moduleInfo.socials?.filter((social) => social.value === 'linkedin')[0]?.path,
      instagram: stats.moduleInfo.socials?.filter((social) => social.value === 'instagram')[0]
        ?.path,
      twitter: stats.moduleInfo.socials?.filter((social) => social.value === 'twitter')[0]?.path,
    });
  }, [stats, reset]);
  const onSubmit = handleSubmit(async (data) => {
    //to see if owner
    // const result = await readContract(config, {
    //   abi: moduleAbi,
    //   address: moduleAddress,
    //   functionName: 'owner',
    // });
    // console.log('result', result);

    try {
      if (address) {
        const moduleDetails = `${data.logoURL}$#$${data.facebook}$#$${data.linkedin}$#$${data.instagram}$#$${data.twitter}`;
        const emission = data.emission * 10 ** 4;
        const para = [emission, moduleDetails];
        const result = await writeContract(config, {
          abi: moduleAbi,
          address: moduleAddress,
          functionName: 'updateEmissionModuleDetails',
          args: para,
        });
        const response = await waitForTransactionReceipt(config, { hash: result });
        if (response != null) {
          if (response && response.status && response.status === 'success') {
            enqueueSnackbar('Updated successfully!', { variant: 'success' });
            dialog.onFalse();
            setUpdater(new Date());
          } else {
            enqueueSnackbar('Updated failed!', { variant: 'false' });
            dialog.onFalse();
            setUpdater(new Date());
          }
        }
      } else {
        enqueueSnackbar(`Don't have enough ${stats.moduleInfo.symbol} staked in this module!`, {
          variant: 'error',
        });
      }
    } catch (e) {
      if (e.message.includes('User rejected the request'))
        enqueueSnackbar(`User rejected the request!`, {
          variant: 'info',
        });
    }
  });
  const handleDistribute = async () => {
    try {
      if (address) {
        const result = await writeContract(config, {
          abi: moduleAbi,
          address: moduleAddress,
          functionName: 'distributeRewards',
        });
        const response = await waitForTransactionReceipt(config, { hash: result });
        if (response != null) {
          if (response && response.status && response.status === 'success') {
            enqueueSnackbar('Distributed Successfully!', { variant: 'success' });
            setUpdater(new Date());
          }
        }
      } else {
        enqueueSnackbar(`Don't have enough ${stats.moduleInfo.symbol} staked in this module!`, {
          variant: 'error',
        });
      }
    } catch (e) {
      if (e.message.includes('User rejected the request'))
        enqueueSnackbar(`User rejected the request!`, {
          variant: 'info',
        });
    }
  };

  return (
    <Stack direction="row" spacing={2}>
      <Button
        fullWidth
        disabled={Number(stats.moduleInfo?.totalStaked) === 0}
        size="large"
        color="warning"
        variant="contained"
        // startIcon={<Iconify icon="solar:cart-plus-bold" width={24} />}
        onClick={handleDistribute}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Distribute Rewards
      </Button>

      <Button fullWidth size="large" variant="contained" onClick={dialog.onTrue}>
        Edit Module Info
      </Button>
      <Dialog open={dialog.value} onClose={dialog.onFalse}>
        {isSubmitting && (
          <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}>
            <CircularProgress color="primary" />
          </Backdrop>
        )}
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle p={3}>Edit Module Info</DialogTitle>

          <DialogContent>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
              pt={2}
            >
              <RHFTextField name="emission" label="Emission" />
              <RHFTextField name="logoURL" label="Image Url" />
              <RHFTextField name="facebook" label="Facebook" />
              <RHFTextField name="linkedin" label="Linkedin" />
              <RHFTextField name="instagram" label="Instagram" />
              <RHFTextField name="twitter" label="Twitter/X" />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={dialog.onFalse} variant="outlined" color="inherit">
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Update
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </Stack>
  );
}
