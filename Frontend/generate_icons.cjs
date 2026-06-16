const fs = require('fs');
const path = require('path');

const iconsList = [
'IconAlertCircle', 'IconArrowLeft', 'IconArrowRight', 'IconBan', 'IconBell', 'IconBolt', 'IconBrandFacebook', 'IconBrandInstagram', 'IconBrandTiktok', 'IconBrandWhatsapp', 'IconCash', 'IconChartBar', 'IconCheck', 'IconChecks', 'IconChevronDown', 'IconChevronLeft', 'IconChevronRight', 'IconChevronUp', 'IconClockPlay', 'IconCoin', 'IconCreditCard', 'IconCurrencyDollar', 'IconDeviceMobile', 'IconDownload', 'IconEdit', 'IconEye', 'IconEyeOff', 'IconFileText', 'IconFileTypePdf', 'IconHeart', 'IconInbox', 'IconIndentDecrease', 'IconInfoCircle', 'IconLifebuoy', 'IconList', 'IconListDetails', 'IconLoader2', 'IconLock', 'IconLogin', 'IconLogout', 'IconMail', 'IconMapPin', 'IconMenu2', 'IconMessageCircle', 'IconPackage', 'IconPhone', 'IconPlug', 'IconPlus', 'IconPower', 'IconPrinter', 'IconQuote', 'IconReceipt', 'IconReceiptRefund', 'IconRefresh', 'IconRocket', 'IconSearch', 'IconSend', 'IconServerCog', 'IconSettings', 'IconShieldCheck', 'IconShieldLock', 'IconShieldX', 'IconStarFilled', 'IconTags', 'IconTie', 'IconTool', 'IconTrash', 'IconUpload', 'IconUser', 'IconUserEdit', 'IconUserPlus', 'IconUsers', 'IconWifi', 'IconWorld', 'IconX'
];

const destDir = path.join(__dirname, 'src', 'components', 'Icons');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

iconsList.forEach(iconName => {
  const fileContent = `<script setup>
import { ${iconName} } from '@tabler/icons-vue';
</script>
<template>
  <${iconName} v-bind="$attrs" />
</template>
`;
  fs.writeFileSync(path.join(destDir, `${iconName}.vue`), fileContent);
});

console.log('Successfully created wrapper components for all tabler icons.');
