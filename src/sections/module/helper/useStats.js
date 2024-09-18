import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { readContract } from '@wagmi/core';
import { erc20Abi } from 'viem';

import { config } from 'src/config';

import moduleAbi from '../../../constant/module.json';

export const useModuleStats = (update, moduleAddress) => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [stats, setStats] = useState({
    loading: true,
    moduleInfo: {},
    userStaked: 0,
    userRewards: 0,
    tokenBalance: 0,
    error: null,
  });

  const fetchModuleInfo = useCallback(async () => {
    try {
      const data = await readContract(config, {
        address: moduleAddress,
        abi: moduleAbi,
        functionName: 'getModuleInfo',
      });
      const moduleDetails = data[3];
      const logoURL = moduleDetails.toString().split('$#$')[0];
      const facebook = moduleDetails.toString().split('$#$')[1];
      const linkedin = moduleDetails.toString().split('$#$')[2];
      const instagram = moduleDetails.toString().split('$#$')[3];
      const twitter = moduleDetails.toString().split('$#$')[4];
      const emissionByPercent = Number(data[7]) / 10 ** 4;
      const socials = [];
      if (facebook) {
        socials.push({
          color: '#1877F2',
          icon: 'eva:facebook-fill',
          name: 'FaceBook',
          path: facebook,
          value: 'facebook',
        });
      }

      if (linkedin) {
        socials.push({
          color: '#007EBB',
          icon: 'eva:linkedin-fill',
          name: 'Linkedin',
          path: linkedin,
          value: 'linkedin',
        });
      }
      if (instagram) {
        socials.push({
          color: '#E02D69',
          icon: 'ant-design:instagram-filled',
          name: 'Instagram',
          path: instagram,
          value: 'instagram',
        });
      }
      if (twitter) {
        socials.push({
          color: '#00AAEC',
          icon: 'eva:twitter-fill',
          name: 'Twitter',
          path: twitter,
          value: 'twitter',
        });
      }
      setStats({
        loading: false,
        moduleInfo: {
          creator: data[8],
          ca: data[0],
          tokenName: data[1],
          symbol: data[2],
          totalStaked: data[6],
          stakers: data[4],
          emission: emissionByPercent,
          logoURL,
          socials,
        },
        userStaked: 0,
        userRewards: 0,
        tokenBalance: 0,
        error: null,
      });
      if (address) {
        const data1 = await readContract(config, {
          address: moduleAddress,
          abi: moduleAbi,
          functionName: 'getUserStaked',
          args: [address],
        });

        const data2 = await readContract(config, {
          address: moduleAddress,
          abi: moduleAbi,
          functionName: 'earned',
          args: [address],
        });

        const data3 = await readContract(config, {
          address: data[0],
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        });

        setStats({
          loading: false,
          moduleInfo: {
            creator: data[8],
            ca: data[0],
            tokenName: data[1],
            symbol: data[2],
            totalStaked: data[6],
            stakers: data[4],
            emission: emissionByPercent,
            logoURL,
            socials,
          },
          userStaked: Number((Number(data1) / 10 ** 18).toFixed(2)),
          userRewards: Number((Number(data2) / 10 ** 18).toFixed(2)),
          tokenBalance: Number((Number(data3) / 10 ** 18).toFixed(2)),
          error: null,
        });
      }
    } catch (e) {
      setStats({ ...stats, loading: false, error: { message: 'Loading Module data failed!' } });
      console.log('E', e);
    }
  }, [update, address, moduleAddress, stats]);
  useEffect(() => {
    fetchModuleInfo();
    // eslint-disable-next-line
  }, [update, chainId, address]);

  return stats;
};
