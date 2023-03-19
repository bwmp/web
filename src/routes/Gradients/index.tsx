import { component$, useVisibleTask$, useStore } from '@builder.io/qwik';
import { DocumentHead, server$ } from '@builder.io/qwik-city';

import Toggle from '~/components/elements/Toggle';
import TextInput, { RawTextInput } from '~/components/elements/TextInput';
import SelectInput from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import ColorInput from '~/components/elements/ColorInput';
import { Button } from '~/components/elements/Button';

import { Gradient } from '~/components/util/HexUtils';
import { presetVersion } from '~/components/util/PresetUtils';
import OutputField from '~/components/elements/OutputField';
import { convertToRGB, convertToHex, getRandomColor } from '~/components/util/RGBUtils';

import {
  $translate as t,
  $plural as p,
  Speak,
} from 'qwik-speak';

const formats = [
  '&#$1$2$3$4$5$6$f$c',
  '<#$1$2$3$4$5$6>$f$c',
  '&x&$1&$2&$3&$4&$5&$6$f$c',
  '§x§$1§$2§$3§$4§$5§$6$f$c',
  '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
];

const presets = {
  'SimplyMC': ['#00FFE0', '#EB00FF'],
  'Rainbow': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
  'Skyline': ['#1488CC', '#2B32B2'],
  'Mango': ['#FFE259', '#FFA751'],
  'Vice City': ['#3494E6', '#EC6EAD'],
  'Dawn': ['#F3904F', '#3B4371'],
  'Rose': ['#F4C4F3', '#FC67FA'],
  'Firewatch': ['#CB2D3E', '#EF473A'],
};

export const setCookie = server$(function (store) {
  const json = JSON.parse(store);
  delete json.alerts;
  Object.keys(json).forEach(key => {
    const existingCookie = this.cookie.get(key);
    if (existingCookie === json[key]) return;
    this.cookie.set(key, encodeURIComponent(json[key]));
  });
});

export const getCookie = server$(function (store) {
  const json = JSON.parse(store);
  delete json.alerts;
  Object.keys(json).forEach(key => {
    const existingCookie: any = this.cookie.get(key);

    if (key == 'colors' && existingCookie) existingCookie.value = existingCookie?.value.split(',');
    json[key] = existingCookie?.value || json[key];
  });
  return JSON.stringify(json);
});

export default component$(() => {
  const store: any = useStore({
    colors: [],
    text: 'SimplyMC',
    format: '&#$1$2$3$4$5$6$f$c',
    formatchar: '&',
    customFormat: false,
    prefix: '',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alerts: [],
  }, { deep: true });

  useVisibleTask$(() => {
    getCookie(JSON.stringify(store)).then((userstore: any) => {
      const parsedUserStore = JSON.parse(userstore);
      for (const key of Object.keys(parsedUserStore)) {
        const value = parsedUserStore[key];
        if (key == 'colors') store[key] = value;
        store[key] = value === 'true' ? true : value === 'false' ? false : value;
      }
      if (store.colors.length == 0) store.colors = ['#00FFE0', '#EB00FF'];
    });
  });

  useVisibleTask$(() => {
    if (document.getElementById('jscolor')) return;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js';
    script.defer = true;
    script.id = 'jscolor';
    document.head.appendChild(script);
  }, { strategy: 'document-idle' });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <Speak assets={['gradient']}>
        <div class="mt-10 min-h-[60px] w-full">
          <h1 class="font-bold text-gray-50 text-4xl mb-2">
            {t('gradient.title@@Hex Gradient')}
          </h1>
          <h2 class="text-gray-50 text-xl mb-12">
            {t('gradient.subtitle@@Hex color gradient creator')}
          </h2>

          <OutputField id="Output" charlimit={256} value={
            (() => {
              let colors = store.colors.map((color: string) => convertToRGB(color));
              if (colors.length < 2) colors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

              let output = store.prefix;
              const text = store.text ? store.text : 'SimplyMC';

              const gradient = new Gradient(colors, text.replace(/ /g, '').length);

              for (let i = 0; i < text.length; i++) {
                const char = text.charAt(i);
                if (char == ' ') {
                  output += char;
                  continue;
                }

                const hex = convertToHex(gradient.next());
                let hexOutput = store.format;
                for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
                let formatCodes = '';
                if (store.format.includes('$f')) {
                  if (store.bold) formatCodes += store.formatchar + 'l';
                  if (store.italic) formatCodes += store.formatchar + 'o';
                  if (store.underline) formatCodes += store.formatchar + 'n';
                  if (store.strikethrough) formatCodes += store.formatchar + 'm';
                }

                hexOutput = hexOutput.replace('$f', formatCodes);
                hexOutput = hexOutput.replace('$c', char);
                output += hexOutput;
              }

              return output;
            })()
          }>
            <h1 class="font-bold text-3xl mb-2">
              {t('gradient.output@@Output')}
            </h1>
            {t('gradient.outputSubtitle@@This is what you put in the chat. Click on it to copy.')}
          </OutputField>

          <h1 class={`text-6xl my-6 break-all max-w-7xl -space-x-[1px] font${store.bold ? '-bold' : ''}${store.italic ? '-italic' : ''}`}>
            {(() => {
              const text = store.text ? store.text : 'SimplyMC';

              let colors = store.colors.map((color: string) => convertToRGB(color));
              if (colors.length < 2) colors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

              const gradient = new Gradient(colors, text.replace(/ /g, '').length);

              let hex = '';
              return text.split('').map((char: string, i: number) => {
                if (char != ' ') hex = convertToHex(gradient.next());
                return (
                  <span key={`char${i}`} style={`color: #${hex};`} class={`font${store.underline ? '-underline' : ''}${store.strikethrough ? '-strikethrough' : ''}`}>
                    {char}
                  </span>
                );
              });
            })()}
          </h1>

          <div class="grid sm:grid-cols-4 gap-2">
            <div class="sm:pr-4">
              <NumberInput id="colors" onIncrement$={() => { if (store.colors.length < store.text.length) { store.colors.push(getRandomColor()); setCookie(JSON.stringify(store)); } }} onDecrement$={() => { if (store.colors.length > 2) store.colors.pop(); setCookie(JSON.stringify(store)); }}>
                {p(store.colors.length, 'gradient.colorAmount')}
              </NumberInput>
              <div class="overflow-auto max-h-32 sm:max-h-[500px] mt-3">
                {store.colors.map((color: string, i: number) => {
                  return (
                    <ColorInput key={`color${i + 1}`} id={`color${i + 1}`} value={color} jscolorData={{ palette: store.colors }} onInput$={(event: any) => { store.colors[i] = event.target!.value; setCookie(JSON.stringify(store)); }}>
                      {t('gradient.hexColorTitle@@Hex Color')} {i + 1}
                    </ColorInput>
                  );
                })}
              </div>
            </div>
            <div class="sm:col-span-3">
              <TextInput id="input" value={store.text} placeholder="SimplyMC" onInput$={(event: any) => { store.text = event.target!.value; setCookie(JSON.stringify(store)); }}>
                {t('gradient.inputText@@Input Text')}
              </TextInput>

              <div class="grid sm:grid-cols-2 gap-2">
                <SelectInput id="format" label="Output Format" value={store.format} onChange$={
                  (event: any) => {
                    if (event.target!.value == 'custom') return store.customFormat = true;
                    store.customFormat = false;
                    store.format = event.target!.value;
                    setCookie(JSON.stringify(store));
                  }
                }>
                  {formats.map((format: any) => (
                    <option key={format} value={format}>
                      {format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '')}
                    </option>
                  ))}
                  <option value={'custom'}>
                    {store.customFormat ? store.format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '') : 'Custom'}
                  </option>
                </SelectInput>
                <TextInput id="formatchar" value={store.formatchar} placeholder="&" onInput$={(event: any) => { store.formatchar = event.target!.value; setCookie(JSON.stringify(store)); }}>
                  {t('gradient.formatCharacter@@Format Character')}
                </TextInput>
              </div>

              {
                store.customFormat && <>
                  <TextInput id="customformat" value={store.format} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(event: any) => { store.format = event.target!.value; setCookie(JSON.stringify(store)); }} class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4">
                    {t('gradient.customFormat@@Custom Format')}
                  </TextInput>
                  <div class="pb-4">
                    <p>{t('gradient.placeholders@@Placeholders:')}</p>
                    <p>$1 - (R)RGGBB</p>
                    <p>$2 - R(R)GGBB</p>
                    <p>$3 - RR(G)GBB</p>
                    <p>$4 - RRG(G)BB</p>
                    <p>$5 - RRGG(B)B</p>
                    <p>$6 - RRGGB(B)</p>
                    <p>$f - {t('gradient.formatting@@Formatting')}</p>
                    <p>$c - {t('gradient.character@@Character')}</p>
                  </div>
                </>
              }

              <TextInput id="prefix" value={store.prefix} placeholder={t('gradient.prefixPlaceholder@@example: \'/nick \'')} onInput$={(event: any) => { store.prefix = event.target!.value; setCookie(JSON.stringify(store)); }}>
                {t('gradient.prefix@@Prefix (Usually used for commands)')}
              </TextInput>

              <SelectInput id="preset" label="Color Preset" value={store.format} onChange$={
                (event: any) => {
                  store.colors = [];
                  setTimeout(() => {
                    store.colors = presets[event.target!.value as keyof typeof presets];
                    setCookie(JSON.stringify(store));
                  }, 1);
                }
              }>
                {Object.keys(presets).map((preset: any) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </SelectInput>

              <label>
                {t('gradient.presets@@Presets')}
              </label>
              <div class="flex gap-2 my-2">
                <Button id="export" onClick$={() => {
                  navigator.clipboard.writeText(JSON.stringify({ version: presetVersion, ...store, alerts: undefined }));
                  const alert = {
                    class: 'text-green-500',
                    text: 'Successfully exported preset to clipboard!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }}>
                Export
                </Button>
                <RawTextInput name="import" placeholder={t('gradient.importPlaceholder@@Import (Paste here)')} onInput$={(event: any) => {
                  let json: any;
                  try {
                    json = JSON.parse(event.target!.value);
                  } catch (error) {
                    const alert = {
                      class: 'text-red-500',
                      text: 'INVALID PRESET!\nIf this is a old preset, please update it using the <a class="text-blue-500" href="/PresetTools">Preset Tools</a> page, If not please report to the <a class="text-blue-500" href="https://discord.simplymc.art/">Developers</a>.',
                    };
                    store.alerts.push(alert);
                    return setTimeout(() => {
                      store.alerts.splice(store.alerts.indexOf(alert), 1);
                    }, 5000);
                  }
                  Object.keys(json).forEach((key: any) => {
                    store[key] = json[key];
                  });
                  const alert = {
                    class: 'text-green-500',
                    text: 'Successfully imported preset!',
                  };
                  store.alerts.push(alert);
                  setTimeout(() => {
                    store.alerts.splice(store.alerts.indexOf(alert), 1);
                  }, 2000);
                }} />
              </div>
              {store.alerts.map((alert: any, i: number) => (
                <p key={`preset-alert${i}`} class={alert.class} dangerouslySetInnerHTML={alert.text} />
              ))}
              <div class="mt-6 mb-4 space-y-4">
                <Toggle id="bold" checked={store.bold} onChange$={(event: any) => { store.bold = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('gradient.bold@@Bold')} - {store.formatchar + 'l'}
                </Toggle>
                <Toggle id="strikethrough" checked={store.strikethrough} onChange$={(event: any) => { store.strikethrough = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('gradient.strikethrough@@Strikethrough')} - {store.formatchar + 'm'}
                </Toggle>
                <Toggle id="underline" checked={store.underline} onChange$={(event: any) => { store.underline = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('gradient.underline@@Underline')} - {store.formatchar + 'n'}
                </Toggle>
                <Toggle id="italic" checked={store.italic} onChange$={(event: any) => { store.italic = event.target!.checked; setCookie(JSON.stringify(store)); }}>
                  {t('gradient.italic@@Italic')} - {store.formatchar + 'o'}
                </Toggle>
              </div>
            </div>
          </div>

        </div>
      </Speak>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Hex Gradients',
  meta: [
    {
      name: 'description',
      content: 'Hex color gradient creator',
    },
    {
      name: 'og:description',
      content: 'Hex color gradient creator',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};