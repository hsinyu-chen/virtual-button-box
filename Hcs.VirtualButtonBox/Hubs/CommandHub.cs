using Hcs.VirtualButtonBox.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using vJoy.Wrapper;

namespace Hcs.VirtualButtonBox.Hubs
{
    public class CommandHub : Hub
    {
        private readonly VJoyFeeder feeder;

        public CommandHub(VJoyFeeder feeder)
        {
            this.feeder = feeder;
        }
        public async Task SetButton(int device, uint button, bool pressed)
        {
            await feeder.Use(device, stick =>
            {
                stick.SetJoystickButton(pressed, button);
            });
        }
        public async Task SetAxis(int device, Axis axis, int value)
        {
            await feeder.Use(device, stick =>
            {
                stick.SetJoystickAxis(value, axis);
            });
        }
    }
}
