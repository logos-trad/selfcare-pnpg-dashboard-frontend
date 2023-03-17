import { Grid, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import { useErrorDispatcher } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { PartyPnpg } from '../../model/PartyPnpg';
import { partiesSelectors } from '../../redux/slices/partiesSlice';
import { useAppSelector } from '../../redux/hooks';
import { retrieveProductBackoffice } from '../../services/partyService';
import PnIcon from '../../assets/pn.svg';
import WelcomeDashboard from './components/welcomeDashboard/WelcomeDashboard';
import PartyCard from './components/partyCard/PartyCard';
import { PartyLogoUploader } from './components/partyCard/components/partyLogoUploader/PartyLogoUploader';
import ActiveProductCard from './components/activeProductsSection/components/ActiveProductCard';

type UrlParams = {
  partyId: string;
};

const DashboardOverview = () => {
  const { t } = useTranslation();
  const { partyId } = useParams<UrlParams>();
  const addError = useErrorDispatcher();
  const parties = useAppSelector(partiesSelectors.selectPartiesList);

  const [_loading, setLoading] = useState<boolean>(false);
  const [selectedParty, setSelectedParty] = useState<PartyPnpg>();

  useEffect(() => {
    const chosenParty = parties?.find((p) => p.externalId === partyId || p.partyId === partyId);
    setSelectedParty(chosenParty);
  }, [partyId]);

  const handleClick = async (productId: string, institutionId: string) => {
    setLoading(true);
    retrieveProductBackoffice(productId, institutionId)
      .then((backOfficeUrl) => window.location.assign(backOfficeUrl))
      .catch((reason) => {
        addError({
          id: 'RETRIEVE_PRODUCT_BACK_OFFICE_ERROR',
          blocking: false,
          error: reason,
          techDescription: `An error occurred while retrieving product back office for institutionId ${institutionId}`,
          toNotify: true,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box p={3} sx={{ width: '100%' }}>
      <WelcomeDashboard businessName={selectedParty?.description} />
      <Grid container direction="row" justifyContent={'center'} alignItems="center" mb={2}>
        <Grid item xs={6} display="flex" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: '700' }}>
            {selectedParty?.description}
          </Typography>
        </Grid>
        {selectedParty && (
          <Grid item xs={6}>
            <PartyLogoUploader partyId={selectedParty.partyId} />
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <PartyCard party={selectedParty} />
      </Grid>
      <Grid item container ml={1} mt={5}>
        <TitleBox
          title={t('overview.notificationAreaProduct.title')}
          mbTitle={3}
          variantTitle="h4"
          titleFontSize="28px"
        />
        <Grid container mb={44}>
          <ActiveProductCard
            cardTitle={t('overview.notificationAreaProduct.card.title')}
            urlLogo={PnIcon}
            btnAction={() =>
              selectedParty ? handleClick('prod-pn-pg', selectedParty.partyId) : undefined
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
