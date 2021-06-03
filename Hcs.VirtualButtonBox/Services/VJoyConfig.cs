using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using vJoy.Wrapper;

namespace Hcs.VirtualButtonBox.Services
{
    public class VJoyDeviceDetailInfo : VJoyDeviceInfo
    {
        public int Buttons { get; set; }
        public int DescretePov { get; set; }
        public Axis[] Axes { get; set; }
        readonly static Dictionary<string, Axis> Map = new()
        {
            { "X", Axis.HID_USAGE_X },
            { "Y", Axis.HID_USAGE_Y },
            { "Z", Axis.HID_USAGE_Z },
            { "Rx", Axis.HID_USAGE_RX },
            { "Ry", Axis.HID_USAGE_RY },
            { "Rz", Axis.HID_USAGE_RZ },
            { "Sl0", Axis.HID_USAGE_SL0 },
            { "Sl1", Axis.HID_USAGE_SL1 }
        };
        public VJoyDeviceDetailInfo(Dictionary<string, string> properies) : base()
        {
            if (properies.TryGetValue("Buttons", out string val))
            {
                if (int.TryParse(val, out int b))
                {
                    Buttons = b;
                }
            }
            if (properies.TryGetValue("Descrete POVs", out string pval))
            {
                if (int.TryParse(pval, out int p))
                {
                    DescretePov = p;
                }
            }
            if (properies.TryGetValue("Axes", out string a))
            {
                Axes = a.Split(' ').Select(x => x.Trim()).Where(x => Map.ContainsKey(x)).Select(x => Map[x]).ToArray();
            }
            if (properies.TryGetValue("Device", out string id))
            {
                if (int.TryParse(id, out int idn))
                {
                    Id = idn;
                    Name = $"Device {id}";
                }
            }
            if (properies.TryGetValue("Descrete POVs", out string sval))
            {
                Status = sval;
            }
        }
    }
    public class VJoyDeviceInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public bool Used { get; set; }

    }
    public class VJoyConfig
    {
        private readonly IOptions<VJoy> options;

        public bool Installed { get; }
        public VJoyConfig(IOptions<VJoy> options)
        {
            this.options = options;
            var folder = new DirectoryInfo(options.Value.RootPath);
            Folder = Path.Combine(folder.FullName, Environment.Is64BitOperatingSystem ? "x64" : "x86");
            ExePath = Path.Combine(Folder, "vJoyConfig.exe");
            Installed = File.Exists(ExePath);
        }
        public string Folder { get; set; }
        public string ExePath { get; set; }

        readonly static Regex parseDevice = new Regex(@"(?<device>[^:]+?(?<id>\d+)):\s+Status:\s*(?<status>\w+)");
        private void ThrowIfNotInstalled()
        {
            if (!Installed)
            {
                throw new Exception($"VJoy not found at {Folder}");
            }
        }
        public async Task DeleteDeviceAsync(int id)
        {
            ThrowIfNotInstalled();
            await CmdHelpers.ExcuteAsync(ExePath, config =>
            {
                config.ArgumentList.Add("-d");
                config.ArgumentList.Add(id.ToString("#0"));
            });
        }
        public async Task CreateDeviceAsync(int id)
        {
            ThrowIfNotInstalled();
            await CmdHelpers.ExcuteAsync(ExePath, config =>
            {
                config.ArgumentList.Add(id.ToString("#0"));
                config.ArgumentList.Add("-f");
                config.ArgumentList.Add("-b");
                config.ArgumentList.Add("32");
                config.ArgumentList.Add("-s");
                config.ArgumentList.Add("1");
            });
        }
        public async Task<VJoyDeviceDetailInfo[]> GetVJoyDeviceDetailInfoAsync(params int[] ids)
        {
            var list = new List<VJoyDeviceDetailInfo>();
            foreach (var s in ids)
            {
                list.Add(await GetVJoyDeviceDetailInfoAsync(s));
            }
            return list.ToArray();
        }
        public async Task<VJoyDeviceDetailInfo> GetVJoyDeviceDetailInfoAsync(int id)
        {
            ThrowIfNotInstalled();
            var lines = await CmdHelpers.ExcuteAsync(ExePath, config =>
            {
                config.ArgumentList.Add("-t");
                config.ArgumentList.Add(id.ToString("#0"));
            });
            var properties = lines.Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Split("\t\t")).Where(x => x.Length == 2).ToDictionary(x => x[0].Trim(':'), x => x[1].Trim());
            return new VJoyDeviceDetailInfo(properties);
        }
        public async Task<VJoyDeviceInfo[]> GetDeviceInfoAsync()
        {
            ThrowIfNotInstalled();
            var lines = await CmdHelpers.ExcuteAsync(ExePath, config => config.ArgumentList.Add("-t"));
            var info = new List<VJoyDeviceInfo>();
            foreach (var line in lines)
            {
                if (line != null)
                {
                    var match = parseDevice.Match(line);
                    if (match.Success)
                    {
                        info.Add(new VJoyDeviceInfo
                        {
                            Name = match.Groups["device"].Value,
                            Status = match.Groups["status"].Value,
                            Id = int.Parse(match.Groups["id"].Value)
                        });
                    }
                }
            }
            return info.ToArray();
        }
    }
}
