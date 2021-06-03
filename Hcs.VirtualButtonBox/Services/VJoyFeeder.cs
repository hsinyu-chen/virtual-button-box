using Hcs.VirtualButtonBox.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using vJoy.Wrapper;

namespace Hcs.VirtualButtonBox.Services
{
    public class VJoyFeeder
    {
        readonly SemaphoreSlim semaphore = new SemaphoreSlim(1, 1);
        readonly ConcurrentDictionary<int, VirtualJoystick> joysticks = new ConcurrentDictionary<int, VirtualJoystick>();
        private readonly ISettingStorage setting;

        public VJoyFeeder(ISettingStorage setting)
        {
            this.setting = setting;
        }
        public async Task Use(int id, Action<VirtualJoystick> use)
        {
            await semaphore.WaitAsync();
            try
            {
                if (joysticks.TryGetValue(id, out VirtualJoystick s))
                {
                    use(s);
                }
            }
            finally
            {
                semaphore.Release();
            }
        }
        public async Task ClaimJoysAsync()
        {
            var basic = await setting.GetAsync<DeviceSettings>("device");
            var selected = (basic.UseDevices ?? Array.Empty<int>()).Distinct().ToArray();
            var removeIds = joysticks.Keys.Where(x => !selected.Contains(x)).ToArray();
            foreach (var j in removeIds)
            {
                if (joysticks.TryRemove(j, out VirtualJoystick joy))
                {
                    joy.Dispose();
                }
            }
            foreach (var u in selected)
            {
                Create(u);
            }

        }

        public void Create(int id)
        {
            semaphore.Wait();
            try
            {
                if (joysticks.ContainsKey(id))
                {
                    if (!joysticks[id].Aquired)
                    {
                        joysticks[id].Aquire();
                    }
                }
                else
                {
                    var j = new VirtualJoystick((uint)id);
                    joysticks.TryAdd(id, j);
                    try
                    {
                        j.Aquire();
                        j.SetJoystickHat(-1, Hats.Hat);
                        j.SetJoystickHat(-1, Hats.HatExt1);
                        j.SetJoystickHat(-1, Hats.HatExt2);
                        j.SetJoystickHat(-1, Hats.HatExt3);
                        j.SetJoystickAxis(0x4000, Axis.HID_USAGE_X);
                        j.SetJoystickAxis(0x4000, Axis.HID_USAGE_Y);
                        j.SetJoystickAxis(0x4000, Axis.HID_USAGE_Z);
                        for (uint i = 1; i < 32; i++)
                        {
                            j.SetJoystickButton(false, i);
                        }
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            finally
            {
                semaphore.Release();
            }
        }
        public void Remove(int id)
        {
            semaphore.Wait();
            try
            {
                if (joysticks.TryRemove(id, out VirtualJoystick joystick))
                {
                    joystick.Dispose();
                }
            }
            finally
            {
                semaphore.Release();
            }
        }
    }
}
