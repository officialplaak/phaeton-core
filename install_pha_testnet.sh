#!/bin/bash
#############################################################
# Phaeton Installation Script                               #
# by: Hotam Singh                                           #
# Date: 29/08/2019                                          #
# contribs: Chai Shepherd [4540393408310767905P]            #
#############################################################

#Variable Declaration
UNAME=$(uname)-$(uname -m)
defaultPhaetonLocation=~
defaultRelease=test

### uncomment below line and comment above line if you want to install with mainnet
# defaultRelease=main

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

#Verification Checks
if [ "$USER" == "root" ]; then
  echo "Error: Phaeton should not be installed be as root. Exiting."
  exit 1
fi

#Adding LC_ALL LANG and LANGUAGE to user profile
if [[ -f ~/.profile && ! "$(grep "en_US.UTF-8" ~/.profile)" ]]; then
  echo "LC_ALL=en_US.UTF-8" >> ~/.profile
  echo "LANG=en_US.UTF-8"  >> ~/.profile
  echo "LANGUAGE=en_US.UTF-8"  >> ~/.profile
elif [[ -f ~/.bash_profile && ! "$(grep "en_US.UTF-8" ~/.bash_profile)" ]]; then
  echo "LC_ALL=en_US.UTF-8" >> ~/.bash_profile
  echo "LANG=en_US.UTF-8"  >> ~/.bash_profile
  echo "LANGUAGE=en_US.UTF-8"  >> ~/.bash_profile
fi

user_prompts() {
  read -r -p "Where do you want to install Phaeton to? (Default $defaultPhaetonLocation): " phaetonLocation
  phaetonLocation=${phaetonLocation:-$defaultPhaetonLocation}
  if [[ ! -r "$phaetonLocation" ]]; then
    echo "$phaetonLocation is not valid, please check and re-excute"
    exit 2;
  fi
  
  read -r -p "Would you like to install the Main or Test Client? (Default $defaultRelease): " release
  release=${release:-$defaultRelease}
  if [[ ! "$release" == "main" && ! "$release" == "test" ]]; then
    echo "$release is not valid, please check and re-excute"
    exit 2;
  fi
}

ntp_checks() {
  #Install NTP or Chrony for Time Management - Physical Machines only
  if [[ "$(uname)" == "Linux" ]]; then
    if [[ -f "/etc/debian_version" &&  ! -f "/proc/user_beancounters" ]]; then
      if sudo pgrep -x "ntpd" > /dev/null; then
        echo "√ NTP is running"
      else
        echo "X NTP is not running"
        read -r -n 1 -p "Would like to install NTP? (y/n): " $REPLY
        if [[  $REPLY =~ ^[Yy]$ ]]; then
          echo -e "\nInstalling NTP, please provide sudo password.\n"
          sudo apt-get install ntp -yyq
          sudo service ntp stop
          sudo ntpdate pool.ntp.org
          sudo service ntp start
          if sudo pgrep -x "ntpd" > /dev/null; then
            echo "√ NTP is running"
          else
            echo -e "\nPhaeton requires NTP running on Debian based systems. Please check /etc/ntp.conf and correct any issues."
            exit 0
          fi
        else
          echo -e "\nPhaeton requires NTP on Debian based systems, exiting."
          exit 0
        fi
      fi #End Debian Checks
    elif [[ -f "/etc/redhat-release" &&  ! -f "/proc/user_beancounters" ]]; then
      if sudo pgrep -x "ntpd" > /dev/null; then
        echo "√ NTP is running"
      else
        if sudo pgrep -x "chronyd" > /dev/null; then
          echo "√ Chrony is running"
        else
          echo "X NTP and Chrony are not running"
          read -r -n 1 -p "Would like to install NTP? (y/n): " $REPLY
          if [[  $REPLY =~ ^[Yy]$ ]]; then
            echo -e "\nInstalling NTP, please provide sudo password.\n"
            sudo yum -yq install ntp ntpdate ntp-doc
            sudo chkconfig ntpd on
            sudo service ntpd stop
            sudo ntpdate pool.ntp.org
            sudo service ntpd start
            if pgrep -x "ntpd" > /dev/null; then
              echo "√ NTP is running"
              else
              echo -e "\nPhaeton requires NTP running on Debian based systems. Please check /etc/ntp.conf and correct any issues."
              exit 0
            fi
          else
            echo -e "\nPhaeton requires NTP or Chrony on RHEL based systems, exiting."
            exit 0
          fi
        fi
      fi #End Redhat Checks
    elif [[ -f "/proc/user_beancounters" ]]; then
      echo "_ Running OpenVZ VM, NTP and Chrony are not required"
    fi
  elif [[ "$(uname)" == "FreeBSD" ]]; then
    if sudo pgrep -x "ntpd" > /dev/null; then
      echo "√ NTP is running"
    else
      echo "X NTP is not running"
      read -r -n 1 -p "Would like to install NTP? (y/n): " $REPLY
      if [[  $REPLY =~ ^[Yy]$ ]]; then
        echo -e "\nInstalling NTP, please provide sudo password.\n"
        sudo pkg install ntp
        sudo sh -c "echo 'ntpd_enable=\"YES\"' >> /etc/rc.conf"
        sudo ntpdate -u pool.ntp.org
        sudo service ntpd start
        if pgrep -x "ntpd" > /dev/null; then
          echo "√ NTP is running"
        else
          echo -e "\nPhaeton requires NTP running on FreeBSD based systems. Please check /etc/ntp.conf and correct any issues."
          exit 0
        fi
      else
        echo -e "\nPhaeton requires NTP FreeBSD based systems, exiting."
        exit 0
      fi
    fi #End FreeBSD Checks
  elif [[ "$(uname)" == "Darwin" ]]; then
    if pgrep -x "ntpd" > /dev/null; then
      echo "√ NTP is running"
    else
      sudo launchctl load /System/Library/LaunchDaemons/org.ntp.ntpd.plist
      sleep 1
      if pgrep -x "ntpd" > /dev/null; then
        echo "√ NTP is running"
      else
        echo -e "\nNTP did not start, Please verify its configured on your system"
        exit 0
      fi
    fi  #End Darwin Checks
  fi #End NTP Checks
}

install_phaeton() {
  phaetonVersion=phaeton-$UNAME.tar.gz
  phaetonDir=`echo $phaetonVersion | cut -d'.' -f1`

  echo -e "\nDownloading current Phaeton binaries: "$phaetonVersion

  curl -Ls "https://downloads.phaeton.io/phaeton/$release/$phaetonVersion" -o $phaetonVersion

  curl -Ls "https://downloads.phaeton.io/phaeton/$release/$phaetonVersion.md5" -o $phaetonVersion.md5

  md5=`md5sum $phaetonVersion | awk '{print $1}'`
  md5_compare=`grep "$phaetonVersion" $phaetonVersion.md5 | awk '{print $1}'`

  if [[ "$md5" == "$md5_compare" ]]; then
    echo "Checksum Passed!"
  else
    echo "Checksum Failed, aborting installation"
    rm -f $phaetonVersion $phaetonVersion.md5
    exit 0
  fi

  echo -e "Extracting Phaeton binaries to "$phaetonLocation/phaeton-$release

  tar -xzf $phaetonVersion -C $phaetonLocation

  mv $phaetonLocation/$phaetonDir $phaetonLocation/phaeton-$release

  echo -e "\nCleaning up downloaded files"
  rm -f $phaetonVersion $phaetonVersion.md5
 
}

configure_phaeton() {

  cd $phaetonLocation/phaeton-$release

  echo -e "\nColdstarting Phaeton for the first time"
  bash phaeton.sh coldstart
  
  sleep 5

  echo -e "\nStopping Phaeton to perform database tuning"
  bash phaeton.sh stop

  echo -e "\nExecuting database tuning operation"
  bash tune.sh

  echo -e "\nStarting Phaeton with all parameters in place"
  bash phaeton.sh start

  sleep 5
  blockHeight=`curl -s http://149.28.172.230:8000/api/loader/status/sync | cut -d: -f5 | cut -d} -f1`

  echo -e "\nCurrent Block Height: " $blockHeight

}

backup_phaeton() {
  echo -e "\nStopping Phaeton to perform a backup"
  cd $phaetonLocation/phaeton-$release
  bash phaeton.sh stop

  echo -e "\nBacking up existing Phaeton Folder"
  mkdir -p $phaetonLocation/backup/  
  mv -f $liskLocation/lisk-$release $liskLocation/backup/    
  
}

upgrade_phaeton() {
  
  echo -e "\nRestoring Database to new Phaeton Install"
  mkdir -p -m700 $phaetonLocation/phaeton-$release/pgsql/data
  cp -rf $phaetonLocation/backup/phaeton-$release/pgsql/data/* $phaetonLocation/phaeton-$release/pgsql/data/
  
  echo -e "\nStarting Phaeton"
  cd $phaetonLocation/phaeton-$release
  bash phaeton.sh start
  
  echo -e "\nWaiting to check Block Height"
  sleep 5
  blockHeight=`curl -s http://149.28.172.230:8000/api/loader/status/sync | cut -d: -f5 | cut -d} -f1`

  echo -e "\nCurrent Block Height: " $blockHeight
}


case $1 in
"install")
  user_prompts
  ntp_checks
  install_phaeton
  configure_phaeton
  ;;
"upgrade")
  user_prompts
  backup_phaeton
  install_phaeton
  upgrade_phaeton
  ;;
*)
  echo "Error: Unrecognized command."
  echo ""
  echo "Available commands are: bash install_pha_test.sh install OR bash install_pha_test.sh upgrade"
  ;;
esac
